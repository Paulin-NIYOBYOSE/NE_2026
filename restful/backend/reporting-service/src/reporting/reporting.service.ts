import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';
import { Report, ReportType, ReportFormat } from '../entities/report.entity';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @Inject('EXTINGUISHER_SERVICE')
    private readonly extinguisherClient: ClientProxy,
    @Inject('INSPECTION_SERVICE')
    private readonly inspectionClient: ClientProxy,
    @Inject('MAINTENANCE_SERVICE')
    private readonly maintenanceClient: ClientProxy,
  ) {}

  async generateReport(generateDto: GenerateReportDto, userId: string) {
    let reportData: any;

    switch (generateDto.type) {
      case ReportType.EXPIRED_EXTINGUISHERS:
        reportData = await this.getExpiredExtinguishersData();
        break;
      case ReportType.INSPECTION_SUMMARY:
        reportData = await this.getInspectionSummaryData();
        break;
      case ReportType.MAINTENANCE_HISTORY:
        reportData = await this.getMaintenanceHistoryData();
        break;
      case ReportType.DAILY:
      case ReportType.MONTHLY:
      case ReportType.YEARLY:
        reportData = await this.getPeriodicReportData(generateDto.type, generateDto.periodStart, generateDto.periodEnd);
        break;
      default:
        reportData = { message: 'Report generated', generatedAt: new Date().toISOString() };
    }

    const report = this.reportRepository.create({
      title: generateDto.title,
      type: generateDto.type,
      format: generateDto.format || ReportFormat.JSON,
      data: reportData,
      generatedBy: userId,
      periodStart: generateDto.periodStart ? new Date(generateDto.periodStart) : null,
      periodEnd: generateDto.periodEnd ? new Date(generateDto.periodEnd) : null,
    });

    return this.reportRepository.save(report);
  }

  async findAll(page: number = 1, limit: number = 10, userId?: string) {
    const where: any = {};
    if (userId) {
      where.generatedBy = userId;
    }

    const [data, total] = await this.reportRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async getDashboardStats() {
    try {
      const extinguisherStats = await firstValueFrom(
        this.extinguisherClient.send('extinguisher.get_stats', {}).pipe(
          timeout(5000),
          catchError(() => of({ total: 0, active: 0, expired: 0, maintenance: 0 })),
        ),
      );
      return {
        extinguishers: extinguisherStats,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        extinguishers: { total: 0, active: 0, expired: 0, maintenance: 0 },
        generatedAt: new Date().toISOString(),
      };
    }
  }

  private async getExpiredExtinguishersData() {
    try {
      return await firstValueFrom(
        this.extinguisherClient.send('extinguisher.get_expired', {}).pipe(
          timeout(5000),
          catchError(() => of([])),
        ),
      );
    } catch {
      return [];
    }
  }

  private async getInspectionSummaryData() {
    return {
      message: 'Inspection summary',
      generatedAt: new Date().toISOString(),
    };
  }

  private async getMaintenanceHistoryData() {
    return {
      message: 'Maintenance history',
      generatedAt: new Date().toISOString(),
    };
  }

  private async getPeriodicReportData(type: ReportType, periodStart?: string, periodEnd?: string) {
    return {
      type,
      periodStart: periodStart || null,
      periodEnd: periodEnd || null,
      generatedAt: new Date().toISOString(),
    };
  }

  async exportAsCsv(id: string): Promise<string> {
    const report = await this.findOne(id);
    const data = report.data;

    if (Array.isArray(data)) {
      if (data.length === 0) return 'No data available\n';
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row: any) =>
        Object.values(row).map((v: any) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v)).join(','),
      );
      return [headers, ...rows].join('\n');
    }

    // For non-array data, convert to CSV format
    return Object.entries(data)
      .map(([k, v]) => `${k},${v}`)
      .join('\n');
  }
}
