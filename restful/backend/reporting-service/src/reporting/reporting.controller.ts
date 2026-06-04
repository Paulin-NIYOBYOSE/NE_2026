import { Controller, Get, Post, Param, Body, Query, Req, Res, HttpStatus } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportingService } from './reporting.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new report' })
  async generate(@Body() generateDto: GenerateReportDto, @Req() req: any) {
    // Accept user ID from x-user-id header (set by API Gateway) or fallback to 'system'
    const userId = req.headers?.['x-user-id'] || req.user?.sub || 'system';
    return this.reportingService.generateReport(generateDto, userId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get real-time dashboard statistics' })
  async getDashboard() {
    return this.reportingService.getDashboardStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all generated reports (admin: all, user: own)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
  ) {
    return this.reportingService.findAll(page || 1, limit || 10, userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user reports' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findMyReports(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    const userId = req.headers?.['x-user-id'] || req.user?.sub || 'system';
    return this.reportingService.findAll(page || 1, limit || 10, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  async findOne(@Param('id') id: string) {
    return this.reportingService.findOne(id);
  }

  @Get(':id/export/csv')
  @ApiOperation({ summary: 'Export report as CSV' })
  async exportCsv(@Param('id') id: string, @Res() res: Response) {
    try {
      const report = await this.reportingService.findOne(id);
      const csvContent = await this.reportingService.exportAsCsv(id);

      const safeName = report.title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/ /g, '_');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
      return res.status(HttpStatus.OK).send(csvContent);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Report not found' });
    }
  }

  // Event handlers — RabbitMQ
  @EventPattern('maintenance.logged')
  async handleMaintenanceLogged(@Payload() data: any) {
    // Could update analytics caches, increment counters, etc.
  }

  @EventPattern('inspection.completed')
  async handleInspectionCompleted(@Payload() data: any) {
    // Trigger analytics update when an inspection completes
  }

  @EventPattern('extinguisher.expired')
  async handleExtinguisherExpired(@Payload() data: any) {
    // Log expiry events for reporting
  }

  @EventPattern('extinguisher.registered')
  async handleExtinguisherRegistered(@Payload() data: any) {
    // New extinguisher registered, update totals
    console.log('Reporting: extinguisher.registered event received', data);
  }
}
