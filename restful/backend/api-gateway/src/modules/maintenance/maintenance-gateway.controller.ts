import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';
import { HttpService } from '../shared/http.service';
import { CreateMaintenanceDto } from '../../dto/swagger.dto';

@ApiTags('Maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('maintenance')
export class MaintenanceGatewayController {
  private readonly maintenanceServiceUrl = process.env.MAINTENANCE_SERVICE_URL || 'http://localhost:5005';

  constructor(private readonly httpService: HttpService) {}

  // CREATE — admin and technician (inspector can also log for their extinguishers)
  @Post()
  @Roles('admin', 'inspector', 'technician')
  @ApiOperation({ summary: 'Log a maintenance action (admin/inspector/technician)' })
  @ApiBody({ type: CreateMaintenanceDto })
  @ApiResponse({ status: 201, description: 'Maintenance logged' })
  async create(@Body() body: any, @Req() req: any) {
    return this.httpService.post(
      `${this.maintenanceServiceUrl}/maintenance`, body,
      req.headers.authorization, req.user,
    );
  }

  // READ — all authenticated users
  @Get()
  @ApiOperation({ summary: 'Get all maintenance logs' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated maintenance logs' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Req() req?: any) {
    return this.httpService.get(
      `${this.maintenanceServiceUrl}/maintenance?page=${page || 1}&limit=${limit || 10}`,
      req.headers.authorization, req.user,
    );
  }

  @Get('extinguisher/:extinguisherId')
  @ApiOperation({ summary: 'Get maintenance history for extinguisher' })
  @ApiParam({ name: 'extinguisherId', type: String, description: 'Extinguisher UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Maintenance history' })
  async findByExtinguisher(@Param('extinguisherId') extinguisherId: string, @Req() req: any) {
    return this.httpService.get(
      `${this.maintenanceServiceUrl}/maintenance/extinguisher/${extinguisherId}`,
      req.headers.authorization, req.user,
    );
  }

  @Get('technician/:technicianId')
  @ApiOperation({ summary: 'Get maintenance logs by technician' })
  @ApiParam({ name: 'technicianId', type: String, description: 'Technician user UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Technician maintenance logs' })
  async findByTechnician(@Param('technicianId') technicianId: string, @Req() req: any) {
    return this.httpService.get(
      `${this.maintenanceServiceUrl}/maintenance/technician/${technicianId}`,
      req.headers.authorization, req.user,
    );
  }

  @Get('history/:extinguisherId')
  @ApiOperation({ summary: 'Get maintenance history with date range' })
  @ApiParam({ name: 'extinguisherId', type: String, description: 'Extinguisher UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate',   required: false, type: String, example: '2024-06-30' })
  @ApiResponse({ status: 200, description: 'Filtered maintenance history' })
  async getHistory(
    @Param('extinguisherId') extinguisherId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?: string,
    @Req() req?: any,
  ) {
    let url = `${this.maintenanceServiceUrl}/maintenance/history/${extinguisherId}`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    return this.httpService.get(url, req.headers.authorization, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance log by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Maintenance log UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Maintenance log details' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.httpService.get(
      `${this.maintenanceServiceUrl}/maintenance/${id}`,
      req.headers.authorization, req.user,
    );
  }
}
