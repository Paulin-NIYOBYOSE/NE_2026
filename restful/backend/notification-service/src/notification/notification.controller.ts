import { Controller, Get, Patch, Param, Query, Body, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.notificationService.findAll(page || 1, limit || 10);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findMyNotifications(
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.findByUserId(userId, page || 1, limit || 10);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Query('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Body() body: { userId: string }) {
    return this.notificationService.markAllAsRead(body.userId);
  }

  @Post('role-request')
  @ApiOperation({ summary: 'Create role change request notification' })
  async createRoleRequestNotification(@Body() data: any) {
    await this.notificationService.createNotificationDirect({
      type: 'system' as any,
      recipient: data.email,
      recipientId: data.userId,
      subject: `Role Change Request: ${data.firstName} to ${data.requestedRole}`,
      body: `User ${data.firstName} (${data.email}) requested role change to ${data.requestedRole}. Reason: ${data.reason}`,
      eventType: 'user.role_request',
    });
    return { message: 'Role request notification created' };
  }

  // Event handlers - listening to RabbitMQ events
  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: any) {
    await this.notificationService.handleUserCreated(data);
  }

  @EventPattern('inspection.scheduled')
  async handleInspectionScheduled(@Payload() data: any) {
    await this.notificationService.handleInspectionScheduled(data);
  }

  @EventPattern('maintenance.logged')
  async handleMaintenanceLogged(@Payload() data: any) {
    await this.notificationService.handleMaintenanceLogged(data);
  }

  @EventPattern('password.reset.requested')
  async handlePasswordResetRequested(@Payload() data: any) {
    await this.notificationService.handlePasswordResetRequested(data);
  }

  @EventPattern('extinguisher.expired')
  async handleExtinguisherExpired(@Payload() data: any) {
    console.log('Notification: extinguisher.expired event received', data);
  }

  @EventPattern('extinguisher.status_changed')
  async handleExtinguisherStatusChanged(@Payload() data: any) {
    console.log('Notification: extinguisher.status_changed event received', data);
  }

  @EventPattern('inspection.completed')
  async handleInspectionCompleted(@Payload() data: any) {
    console.log('Notification: inspection.completed event received', data);
  }

  @EventPattern('inspection.cancelled')
  async handleInspectionCancelled(@Payload() data: any) {
    console.log('Notification: inspection.cancelled event received', data);
  }

  @EventPattern('role.request.created')
  async handleRoleRequestCreated(@Payload() data: any) {
    await this.notificationService.handleRoleRequestCreated(data);
  }

  @EventPattern('role.request.approved')
  async handleRoleRequestApproved(@Payload() data: any) {
    await this.notificationService.handleRoleRequestApproved(data);
  }

  @EventPattern('role.request.rejected')
  async handleRoleRequestRejected(@Payload() data: any) {
    await this.notificationService.handleRoleRequestRejected(data);
  }
}
