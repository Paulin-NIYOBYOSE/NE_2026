import { Controller, Post, Get, Put, Patch, Delete, Body, UseGuards, Req, HttpCode, HttpStatus, Param, Query, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { RoleRequestStatus } from '../entities/role-request.entity';
import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (public - USER role only)' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: any) {
    const userId = req.user?.sub || req.headers?.['x-user-id'];
    return this.authService.logout(userId);
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.headers?.['x-user-id'] || req.user?.sub;
    return this.authService.updateProfile(userId, dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own profile' })
  async getProfile(@Req() req: any) {
    const userId = req.headers?.['x-user-id'] || req.user?.sub;
    return this.authService.getProfile(userId);
  }

  @Put('profile/password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change own password' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.headers?.['x-user-id'] || req.user?.sub;
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async getAllUsers(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.authService.getAllUsers(page || 1, limit || 10, search);
  }

  @Get('users/inspectors')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all inspectors for dropdown' })
  async getInspectors() {
    return this.authService.getInspectors();
  }

  @Get('users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string) {
    return this.authService.getProfile(id);
  }

  @Put('users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(id, dto);
  }

  @Delete('users/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  async deleteUser(@Param('id') id: string) {
    // Mark as inactive instead of hard delete for data integrity
    return this.authService.toggleUserStatus(id, false);
  }

  @Patch('users/:id/deactivate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a user (admin only)' })
  async deactivateUser(@Param('id') id: string) {
    return this.authService.toggleUserStatus(id, false);
  }

  @Patch('users/:id/activate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a user (admin only)' })
  async activateUser(@Param('id') id: string) {
    return this.authService.toggleUserStatus(id, true);
  }

  @Patch('users/:id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user role (admin only)' })
  async changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) {
    return this.authService.changeRole(id, dto.role, dto.reason);
  }

  @Post('admin/create-privileged')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create admin/inspector/technician (admin only)' })
  async createPrivilegedUser(@Req() req: any, @Body() dto: RegisterDto) {
    const creatorRole = req.headers?.['x-user-role'] || req.user?.role;
    return this.authService.createPrivilegedUser(dto, creatorRole);
  }

  // ── Role Requests ──────────────────────────────────────────────

  @Post('role-requests')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a role change' })
  async createRoleRequest(@Req() req: any, @Body() body: { requestedRole: string; reason?: string }) {
    const userId = req.headers?.['x-user-id'] || req.user?.sub;
    return this.authService.createRoleRequest(userId, body.requestedRole as any, body.reason);
  }

  @Get('role-requests')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all role requests (admin only)' })
  async getRoleRequests(@Query('status') status?: string) {
    return this.authService.getRoleRequests(status as RoleRequestStatus);
  }

  @Get('role-requests/my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my role requests' })
  async getMyRoleRequests(@Req() req: any) {
    const userId = req.headers?.['x-user-id'] || req.user?.sub;
    return this.authService.getMyRoleRequests(userId);
  }

  @Patch('role-requests/:id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve role request (admin only)' })
  async approveRoleRequest(@Param('id') id: string, @Req() req: any, @Body() body?: { reviewNote?: string }) {
    const adminId = req.headers?.['x-user-id'] || req.user?.sub;
    return this.authService.approveRoleRequest(id, adminId, body?.reviewNote);
  }

  @Patch('role-requests/:id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject role request (admin only)' })
  async rejectRoleRequest(@Param('id') id: string, @Req() req: any, @Body() body?: { reviewNote?: string }) {
    const adminId = req.headers?.['x-user-id'] || req.user?.sub;
    return this.authService.rejectRoleRequest(id, adminId, body?.reviewNote);
  }

  // Microservice message handlers
  @MessagePattern('auth.validate_token')
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern('auth.get_user')
  async getUser(@Payload() data: { userId: string }) {
    return this.authService.getProfile(data.userId);
  }

  @MessagePattern('auth.get_inspectors')
  async handleGetInspectors() {
    return this.authService.getInspectors();
  }

  @MessagePattern('auth.get_all_users')
  async handleGetAllUsers(@Payload() data: { page?: number; limit?: number; search?: string }) {
    return this.authService.getAllUsers(data.page || 1, data.limit || 10, data.search);
  }
}
