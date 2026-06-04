import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { HttpService } from '../shared/http.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationGatewayController {
  private readonly notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5007';

  constructor(private readonly httpService: HttpService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications (admin) or my notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated notifications' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Req() req?: any) {
    const userId = req.user?.sub || req.headers?.['x-user-id'];
    return this.httpService.get(
      `${this.notificationServiceUrl}/notifications/my?userId=${userId}&page=${page || 1}&limit=${limit || 10}`,
      req.headers.authorization,
      req.user,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: '{ count: number }' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.sub || req.headers?.['x-user-id'];
    return this.httpService.get(
      `${this.notificationServiceUrl}/notifications/unread-count?userId=${userId}`,
      req.headers.authorization,
      req.user,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', type: String, description: 'Notification UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.httpService.patch(
      `${this.notificationServiceUrl}/notifications/${id}/read`,
      {},
      req.headers.authorization,
      req.user,
    );
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.sub || req.headers?.['x-user-id'];
    return this.httpService.post(
      `${this.notificationServiceUrl}/notifications/mark-all-read`,
      { userId },
      req.headers.authorization,
      req.user,
    );
  }
}
