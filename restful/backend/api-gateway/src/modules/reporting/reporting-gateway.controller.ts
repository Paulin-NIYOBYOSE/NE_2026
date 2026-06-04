import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, Res, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';
import { HttpService } from '../shared/http.service';
import { GenerateReportDto } from '../../dto/swagger.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportingGatewayController {
  private readonly reportingServiceUrl = process.env.REPORTING_SERVICE_URL || 'http://localhost:5006';

  constructor(private readonly httpService: HttpService) {}

  @Post()
  @Roles('admin', 'inspector')
  @ApiOperation({ summary: 'Generate a new report (admin/inspector only)' })
  @ApiBody({ type: GenerateReportDto })
  @ApiResponse({ status: 201, description: 'Report generated' })
  async generate(@Body() body: any, @Req() req: any) {
    return this.httpService.post(
      `${this.reportingServiceUrl}/reports`, body,
      req.headers.authorization, req.user,
    );
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats (all authenticated roles)' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics object' })
  async getDashboard(@Req() req: any) {
    return this.httpService.get(
      `${this.reportingServiceUrl}/reports/dashboard`,
      req.headers.authorization, req.user,
    );
  }

  @Get()
  @Roles('admin', 'inspector')
  @ApiOperation({ summary: 'Get all reports (admin/inspector)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated reports' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Req() req?: any) {
    return this.httpService.get(
      `${this.reportingServiceUrl}/reports?page=${page || 1}&limit=${limit || 10}`,
      req.headers.authorization, req.user,
    );
  }

  @Get(':id')
  @Roles('admin', 'inspector')
  @ApiOperation({ summary: 'Get report by ID (admin/inspector)' })
  @ApiParam({ name: 'id', type: String, description: 'Report UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Report details' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.httpService.get(
      `${this.reportingServiceUrl}/reports/${id}`,
      req.headers.authorization, req.user,
    );
  }

  @Get(':id/export/csv')
  @Roles('admin', 'inspector')
  @ApiOperation({ summary: 'Export report as CSV (admin/inspector)' })
  @ApiParam({ name: 'id', type: String, description: 'Report UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'CSV file stream' })
  async exportCsv(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    await this.httpService.proxyRaw(
      `${this.reportingServiceUrl}/reports/${id}/export/csv`,
      res,
      req.headers.authorization,
      req.user,
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user reports' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'User-specific reports' })
  async findMyReports(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.httpService.get(
      `${this.reportingServiceUrl}/reports/my?page=${page || 1}&limit=${limit || 10}`,
      req.headers.authorization,
      req.user,
    );
  }

  // ── Audit Logs ──────────────────────────────────────────────
  @Get('audit-logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all audit logs (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'action', required: false, type: String, example: 'create' })
  @ApiQuery({ name: 'entityType', required: false, type: String, example: 'extinguisher' })
  @ApiQuery({ name: 'performedBy', required: false, type: String, example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('performedBy') performedBy?: string,
    @Req() req?: any,
  ) {
    let url = `${this.reportingServiceUrl}/audit-logs?page=${page || 1}&limit=${limit || 10}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;
    if (entityType) url += `&entityType=${encodeURIComponent(entityType)}`;
    if (performedBy) url += `&performedBy=${encodeURIComponent(performedBy)}`;
    return this.httpService.get(url, req.headers.authorization, req.user);
  }

  @Get('audit-logs/my')
  @ApiOperation({ summary: 'Get current user audit logs' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'User audit logs' })
  async getMyAuditLogs(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.httpService.get(
      `${this.reportingServiceUrl}/audit-logs/my?page=${page || 1}&limit=${limit || 10}`,
      req.headers.authorization,
      req.user,
    );
  }
}
