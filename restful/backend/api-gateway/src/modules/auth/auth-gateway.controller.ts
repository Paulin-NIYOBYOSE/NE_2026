import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { HttpService } from '../shared/http.service';
import { LoginDto, RegisterDto, RefreshTokenDto, RequestPasswordResetDto, ConfirmPasswordResetDto, CreatePrivilegedUserDto } from '../../dto/swagger.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthGatewayController {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (USER role only)' })
  @ApiBody({ type: RegisterDto, description: 'Registration details' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() body: any) {
    return this.httpService.post(`${this.authServiceUrl}/auth/register`, body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto, description: 'Login credentials' })
  @ApiResponse({ status: 200, description: 'Login successful — returns accessToken and refreshToken' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: any) {
    return this.httpService.post(`${this.authServiceUrl}/auth/login`, body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto, description: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens issued' })
  async refresh(@Body() body: any) {
    return this.httpService.post(`${this.authServiceUrl}/auth/refresh`, body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: any) {
    return this.httpService.post(`${this.authServiceUrl}/auth/logout`, {}, req.headers.authorization, req.user);
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: RequestPasswordResetDto, description: 'Email for password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async requestPasswordReset(@Body() body: any) {
    return this.httpService.post(`${this.authServiceUrl}/auth/password-reset/request`, body);
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiBody({ type: ConfirmPasswordResetDto, description: 'Token and new password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async confirmPasswordReset(@Body() body: any) {
    return this.httpService.post(`${this.authServiceUrl}/auth/password-reset/confirm`, body);
  }

  @Post('admin/create-privileged')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin/inspector/technician (admin only)' })
  @ApiBody({ type: CreatePrivilegedUserDto, description: 'Privileged user details' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  async createPrivilegedUser(@Body() body: any, @Req() req: any) {
    return this.httpService.post(
      `${this.authServiceUrl}/auth/admin/create-privileged`,
      body,
      req.headers.authorization,
      req.user,
    );
  }
}
