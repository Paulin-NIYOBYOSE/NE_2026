import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Log a maintenance action' })
  async create(@Body() createDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maintenance logs with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.maintenanceService.findAll(page || 1, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance log by ID' })
  async findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Get('extinguisher/:extinguisherId')
  @ApiOperation({ summary: 'Get maintenance history for an extinguisher' })
  async findByExtinguisher(@Param('extinguisherId') extinguisherId: string) {
    return this.maintenanceService.findByExtinguisher(extinguisherId);
  }

  @Get('technician/:technicianId')
  @ApiOperation({ summary: 'Get maintenance logs by technician' })
  async findByTechnician(
    @Param('technicianId') technicianId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.maintenanceService.findByTechnician(technicianId, page || 1, limit || 10);
  }

  @Get('history/:extinguisherId')
  @ApiOperation({ summary: 'Get maintenance history with date range' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getHistory(
    @Param('extinguisherId') extinguisherId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.maintenanceService.getHistory(extinguisherId, startDate, endDate);
  }

  // Microservice message handlers
  @MessagePattern('maintenance.find_by_extinguisher')
  async handleFindByExtinguisher(@Payload() data: { extinguisherId: string }) {
    return this.maintenanceService.findByExtinguisher(data.extinguisherId);
  }
}
