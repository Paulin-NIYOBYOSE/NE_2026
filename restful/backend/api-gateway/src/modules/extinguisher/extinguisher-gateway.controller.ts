import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';
import { HttpService } from '../shared/http.service';
import { CreateExtinguisherDto, UpdateExtinguisherDto } from '../../dto/swagger.dto';

@ApiTags('Extinguishers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('extinguishers')
export class ExtinguisherGatewayController {
  private readonly extinguisherServiceUrl = process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:5003';

  constructor(private readonly httpService: HttpService) {}

  // CREATE — admin only
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Register a new fire extinguisher (admin only)' })
  @ApiBody({ type: CreateExtinguisherDto })
  @ApiResponse({ status: 201, description: 'Extinguisher created' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  async create(@Body() body: any, @Req() req: any) {
    return this.httpService.post(
      `${this.extinguisherServiceUrl}/extinguishers`, body,
      req.headers.authorization, req.user,
    );
  }

  // READ — all authenticated users
  @Get()
  @ApiOperation({ summary: 'Get all extinguishers' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'active', enum: ['active', 'expired', 'maintenance', 'decommissioned'] })
  @ApiResponse({ status: 200, description: 'Paginated extinguisher list' })
  async findAll(@Query() query: any, @Req() req: any) {
    const qs = new URLSearchParams(query).toString();
    return this.httpService.get(
      `${this.extinguisherServiceUrl}/extinguishers?${qs}`,
      req.headers.authorization, req.user,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get extinguisher statistics' })
  @ApiResponse({ status: 200, description: 'Statistics object' })
  async getStats(@Req() req: any) {
    return this.httpService.get(
      `${this.extinguisherServiceUrl}/extinguishers/stats`,
      req.headers.authorization, req.user,
    );
  }

  @Get('expired')
  @Roles('admin', 'inspector')
  @ApiOperation({ summary: 'Get expired extinguishers (admin/inspector)' })
  @ApiResponse({ status: 200, description: 'List of expired extinguishers' })
  async getExpired(@Req() req: any) {
    return this.httpService.get(
      `${this.extinguisherServiceUrl}/extinguishers/expired`,
      req.headers.authorization, req.user,
    );
  }

  @Get('select-options')
  @ApiOperation({ summary: 'Get extinguishers for dropdown selection' })
  @ApiResponse({ status: 200, description: 'List of {id, serialNumber} pairs' })
  async getSelectOptions(@Req() req: any) {
    return this.httpService.get(
      `${this.extinguisherServiceUrl}/extinguishers/select-options`,
      req.headers.authorization, req.user,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get extinguisher by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Extinguisher UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Extinguisher details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.httpService.get(
      `${this.extinguisherServiceUrl}/extinguishers/${id}`,
      req.headers.authorization, req.user,
    );
  }

  // UPDATE — admin only
  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update extinguisher (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Extinguisher UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateExtinguisherDto })
  @ApiResponse({ status: 200, description: 'Extinguisher updated' })
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.httpService.put(
      `${this.extinguisherServiceUrl}/extinguishers/${id}`, body,
      req.headers.authorization, req.user,
    );
  }

  // DELETE — admin only
  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete extinguisher (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Extinguisher UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Extinguisher deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.httpService.delete(
      `${this.extinguisherServiceUrl}/extinguishers/${id}`,
      req.headers.authorization, req.user,
    );
  }
}
