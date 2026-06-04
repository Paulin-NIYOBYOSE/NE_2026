import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';
import { HttpService } from '../shared/http.service';
import { CreateInspectionDto, UpdateInspectionDto } from '../../dto/swagger.dto';

@ApiTags('Inspections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inspections')
export class InspectionGatewayController {
  private readonly inspectionServiceUrl = process.env.INSPECTION_SERVICE_URL || 'http://localhost:5004';

  constructor(private readonly httpService: HttpService) {}

  // CREATE — admin and inspector can schedule
  @Post()
  @Roles('admin', 'inspector', 'user')
  @ApiOperation({ summary: 'Schedule a new inspection' })
  @ApiBody({ type: CreateInspectionDto })
  @ApiResponse({ status: 201, description: 'Inspection scheduled' })
  async create(@Body() body: any, @Req() req: any) {
    return this.httpService.post(
      `${this.inspectionServiceUrl}/inspections`, body,
      req.headers.authorization, req.user,
    );
  }

  // READ — all authenticated users
  @Get()
  @ApiOperation({ summary: 'Get all inspections' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated inspection list' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Req() req?: any) {
    return this.httpService.get(
      `${this.inspectionServiceUrl}/inspections?page=${page || 1}&limit=${limit || 10}`,
      req.headers.authorization, req.user,
    );
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming inspections' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
  @ApiResponse({ status: 200, description: 'Upcoming inspections' })
  async getUpcoming(@Query('days') days?: number, @Req() req?: any) {
    return this.httpService.get(
      `${this.inspectionServiceUrl}/inspections/upcoming?days=${days || 7}`,
      req.headers.authorization, req.user,
    );
  }

  @Get('inspector/:inspectorId')
  @ApiOperation({ summary: 'Get inspections by inspector' })
  @ApiParam({ name: 'inspectorId', type: String, description: 'Inspector user UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Inspections for inspector' })
  async findByInspector(@Param('inspectorId') inspectorId: string, @Req() req: any) {
    return this.httpService.get(
      `${this.inspectionServiceUrl}/inspections/inspector/${inspectorId}`,
      req.headers.authorization, req.user,
    );
  }

  @Get('extinguisher/:extinguisherId')
  @ApiOperation({ summary: 'Get inspections by extinguisher' })
  @ApiParam({ name: 'extinguisherId', type: String, description: 'Extinguisher UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Inspections for extinguisher' })
  async findByExtinguisher(@Param('extinguisherId') extinguisherId: string, @Req() req: any) {
    return this.httpService.get(
      `${this.inspectionServiceUrl}/inspections/extinguisher/${extinguisherId}`,
      req.headers.authorization, req.user,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inspection by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Inspection UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Inspection details' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.httpService.get(
      `${this.inspectionServiceUrl}/inspections/${id}`,
      req.headers.authorization, req.user,
    );
  }

  // UPDATE — admin and inspector
  @Put(':id')
  @Roles('admin', 'inspector')
  @ApiOperation({ summary: 'Update inspection (admin/inspector)' })
  @ApiParam({ name: 'id', type: String, description: 'Inspection UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateInspectionDto })
  @ApiResponse({ status: 200, description: 'Inspection updated' })
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.httpService.put(
      `${this.inspectionServiceUrl}/inspections/${id}`, body,
      req.headers.authorization, req.user,
    );
  }

  // CANCEL — admin and inspector
  @Patch(':id/cancel')
  @Roles('admin', 'inspector')
  @ApiOperation({ summary: 'Cancel inspection (admin/inspector)' })
  @ApiParam({ name: 'id', type: String, description: 'Inspection UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Inspection cancelled' })
  async cancel(@Param('id') id: string, @Req() req: any) {
    return this.httpService.patch(
      `${this.inspectionServiceUrl}/inspections/${id}/cancel`, {},
      req.headers.authorization, req.user,
    );
  }
}
