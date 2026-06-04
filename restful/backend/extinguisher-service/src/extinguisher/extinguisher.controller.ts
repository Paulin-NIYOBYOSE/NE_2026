import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExtinguisherService } from './extinguisher.service';
import { CreateExtinguisherDto } from './dto/create-extinguisher.dto';
import { UpdateExtinguisherDto } from './dto/update-extinguisher.dto';
import { FilterExtinguisherDto } from './dto/filter-extinguisher.dto';

@ApiTags('Fire Extinguishers')
@ApiBearerAuth()
@Controller('extinguishers')
export class ExtinguisherController {
  constructor(private readonly extinguisherService: ExtinguisherService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new fire extinguisher' })
  async create(@Body() createDto: CreateExtinguisherDto) {
    return this.extinguisherService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all extinguishers with filter/search/sort/pagination' })
  async findAll(@Query() filterDto: FilterExtinguisherDto) {
    return this.extinguisherService.findAll(filterDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get extinguisher statistics' })
  async getStats() {
    return this.extinguisherService.getStats();
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get all expired extinguishers' })
  async getExpired() {
    return this.extinguisherService.getExpired();
  }

  @Get('select-options')
  @ApiOperation({ summary: 'Get extinguishers for dropdown selection' })
  async getSelectOptions() {
    return this.extinguisherService.getSelectOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get extinguisher by ID' })
  async findOne(@Param('id') id: string) {
    return this.extinguisherService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update extinguisher' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateExtinguisherDto) {
    return this.extinguisherService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete extinguisher' })
  async remove(@Param('id') id: string) {
    return this.extinguisherService.remove(id);
  }

  // Microservice message handlers
  @MessagePattern('extinguisher.find_one')
  async handleFindOne(@Payload() data: { id: string }) {
    return this.extinguisherService.findOne(data.id);
  }

  @MessagePattern('extinguisher.get_stats')
  async handleGetStats() {
    return this.extinguisherService.getStats();
  }

  @MessagePattern('extinguisher.get_expired')
  async handleGetExpired() {
    return this.extinguisherService.getExpired();
  }

  @MessagePattern('extinguisher.select_options')
  async handleSelectOptions() {
    return this.extinguisherService.getSelectOptions();
  }
}
