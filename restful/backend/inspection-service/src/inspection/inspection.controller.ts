import { Controller, Get, Post, Put, Patch, Param, Body, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InspectionService } from './inspection.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';

@ApiTags('Inspections')
@ApiBearerAuth()
@Controller('inspections')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new inspection' })
  async create(@Body() createDto: CreateInspectionDto) {
    return this.inspectionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inspections with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.inspectionService.findAll(page || 1, limit || 10);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming inspections' })
  @ApiQuery({ name: 'days', required: false })
  async getUpcoming(@Query('days') days?: number) {
    return this.inspectionService.getUpcoming(days || 7);
  }

  @Get('inspector/:inspectorId')
  @ApiOperation({ summary: 'Get inspections by inspector' })
  async findByInspector(
    @Param('inspectorId') inspectorId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inspectionService.findByInspector(inspectorId, page || 1, limit || 10);
  }

  @Get('extinguisher/:extinguisherId')
  @ApiOperation({ summary: 'Get inspections by extinguisher' })
  async findByExtinguisher(@Param('extinguisherId') extinguisherId: string) {
    return this.inspectionService.findByExtinguisher(extinguisherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inspection by ID' })
  async findOne(@Param('id') id: string) {
    return this.inspectionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inspection' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateInspectionDto) {
    return this.inspectionService.update(id, updateDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel inspection' })
  async cancel(@Param('id') id: string) {
    return this.inspectionService.cancel(id);
  }

  // Microservice message handlers
  @MessagePattern('inspection.find_by_extinguisher')
  async handleFindByExtinguisher(@Payload() data: { extinguisherId: string }) {
    return this.inspectionService.findByExtinguisher(data.extinguisherId);
  }
}
