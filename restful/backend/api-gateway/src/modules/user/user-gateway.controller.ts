import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';
import { HttpService } from '../shared/http.service';
import { UpdateProfileDto, ChangePasswordDto, UpdateUserDto, ChangeRoleDto, CreateRoleRequestDto, ReviewRoleRequestDto, IdParamDto } from '../../dto/swagger.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserGatewayController {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
  private readonly notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5007';

  constructor(private readonly httpService: HttpService) {}

  // ── Self-service (any authenticated user) ──────────────────────
  @Get('profile')
  @ApiOperation({ summary: 'Get own profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  async getProfile(@Req() req: any) {
    return this.httpService.get(
      `${this.authServiceUrl}/auth/profile`,
      req.headers.authorization, req.user,
    );
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@Body() body: any, @Req() req: any) {
    return this.httpService.put(
      `${this.authServiceUrl}/auth/profile`, body,
      req.headers.authorization, req.user,
    );
  }

  @Put('profile/password')
  @ApiOperation({ summary: 'Change own password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(@Body() body: any, @Req() req: any) {
    return this.httpService.put(
      `${this.authServiceUrl}/auth/profile/password`, body,
      req.headers.authorization, req.user,
    );
  }

  // ── Admin-only endpoints ────────────────────────────────────────
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiQuery({ name: 'page',   required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit',  required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    let url = `${this.authServiceUrl}/auth/users?page=${page || 1}&limit=${limit || 10}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.httpService.get(url, req.headers.authorization, req.user);
  }

  @Get('inspectors')
  @ApiOperation({ summary: 'Get inspector list for dropdowns' })
  @ApiResponse({ status: 200, description: 'List of inspectors' })
  async getInspectors(@Req() req: any) {
    return this.httpService.get(
      `${this.authServiceUrl}/auth/users/inspectors`,
      req.headers.authorization, req.user,
    );
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.httpService.get(
      `${this.authServiceUrl}/auth/users/${id}`,
      req.headers.authorization, req.user,
    );
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.httpService.put(
      `${this.authServiceUrl}/auth/users/${id}`, body,
      req.headers.authorization, req.user,
    );
  }

  @Patch(':id/deactivate')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate user (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  async deactivate(@Param('id') id: string, @Req() req: any) {
    return this.httpService.patch(
      `${this.authServiceUrl}/auth/users/${id}/deactivate`, {},
      req.headers.authorization, req.user,
    );
  }

  @Patch(':id/activate')
  @Roles('admin')
  @ApiOperation({ summary: 'Activate user (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'User activated' })
  async activate(@Param('id') id: string, @Req() req: any) {
    return this.httpService.patch(
      `${this.authServiceUrl}/auth/users/${id}/activate`, {},
      req.headers.authorization, req.user,
    );
  }

  @Patch(':id/role')
  @Roles('admin')
  @ApiOperation({ summary: 'Change user role (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: ChangeRoleDto })
  @ApiResponse({ status: 200, description: 'Role changed' })
  async changeRole(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.httpService.patch(
      `${this.authServiceUrl}/auth/users/${id}/role`,
      body,
      req.headers.authorization,
      req.user,
    );
  }

  @Post('role-requests')
  @ApiOperation({ summary: 'Request a role change' })
  @ApiBody({ type: CreateRoleRequestDto })
  @ApiResponse({ status: 201, description: 'Role request created' })
  async createRoleRequest(@Body() body: any, @Req() req: any) {
    return this.httpService.post(
      `${this.authServiceUrl}/auth/role-requests`,
      body,
      req.headers.authorization,
      req.user,
    );
  }

  @Get('role-requests')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all role requests (admin only)' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'pending', enum: ['pending', 'approved', 'rejected'] })
  @ApiResponse({ status: 200, description: 'List of role requests' })
  async getRoleRequests(@Query('status') status: string, @Req() req: any) {
    let url = `${this.authServiceUrl}/auth/role-requests`;
    if (status) url += `?status=${encodeURIComponent(status)}`;
    return this.httpService.get(url, req.headers.authorization, req.user);
  }

  @Get('role-requests/my')
  @ApiOperation({ summary: 'Get my role requests' })
  @ApiResponse({ status: 200, description: 'Current user role requests' })
  async getMyRoleRequests(@Req() req: any) {
    return this.httpService.get(
      `${this.authServiceUrl}/auth/role-requests/my`,
      req.headers.authorization,
      req.user,
    );
  }

  @Patch('role-requests/:id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve role request (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Role request UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: ReviewRoleRequestDto })
  @ApiResponse({ status: 200, description: 'Request approved' })
  async approveRoleRequest(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.httpService.patch(
      `${this.authServiceUrl}/auth/role-requests/${id}/approve`,
      body,
      req.headers.authorization,
      req.user,
    );
  }

  @Patch('role-requests/:id/reject')
  @Roles('admin')
  @ApiOperation({ summary: 'Reject role request (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Role request UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: ReviewRoleRequestDto })
  @ApiResponse({ status: 200, description: 'Request rejected' })
  async rejectRoleRequest(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.httpService.patch(
      `${this.authServiceUrl}/auth/role-requests/${id}/reject`,
      body,
      req.headers.authorization,
      req.user,
    );
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.httpService.patch(
      `${this.authServiceUrl}/auth/users/${id}/deactivate`, {},
      req.headers.authorization, req.user,
    );
  }
}
