import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { MaintenanceLog } from '../entities/maintenance-log.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceLog)
    private readonly maintenanceRepository: Repository<MaintenanceLog>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('REPORTING_SERVICE')
    private readonly reportingClient: ClientProxy,
  ) {}

  async create(createDto: CreateMaintenanceDto) {
    const log = this.maintenanceRepository.create(createDto);
    const saved = await this.maintenanceRepository.save(log);

    // Emit maintenance.logged event
    this.reportingClient.emit('maintenance.logged', {
      maintenanceId: saved.id,
      extinguisherId: saved.extinguisherId,
      maintenanceType: saved.maintenanceType,
      conditionAfter: saved.conditionAfter,
    });

    this.notificationClient.emit('maintenance.logged', {
      maintenanceId: saved.id,
      extinguisherId: saved.extinguisherId,
      technicianId: saved.technicianId,
      description: saved.description,
    });

    return saved;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.maintenanceRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { maintenanceDate: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const log = await this.maintenanceRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Maintenance log with ID ${id} not found`);
    }
    return log;
  }

  async findByExtinguisher(extinguisherId: string) {
    return this.maintenanceRepository.find({
      where: { extinguisherId },
      order: { maintenanceDate: 'DESC' },
    });
  }

  async findByTechnician(technicianId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.maintenanceRepository.findAndCount({
      where: { technicianId },
      skip: (page - 1) * limit,
      take: limit,
      order: { maintenanceDate: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getHistory(extinguisherId: string, startDate?: string, endDate?: string) {
    const queryBuilder = this.maintenanceRepository
      .createQueryBuilder('log')
      .where('log.extinguisherId = :extinguisherId', { extinguisherId });

    if (startDate && endDate) {
      queryBuilder.andWhere('log.maintenanceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder.orderBy('log.maintenanceDate', 'DESC').getMany();
  }
}
