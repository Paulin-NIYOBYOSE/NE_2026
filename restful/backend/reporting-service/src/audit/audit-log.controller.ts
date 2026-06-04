import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { AuditAction } from '../entities/audit-log.entity';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs (admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'performedBy', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('performedBy') performedBy?: string,
  ) {
    return this.auditLogService.findAll(page || 1, limit || 10, { action, entityType, performedBy });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user audit logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findMyLogs(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    const userId = req.headers?.['x-user-id'] || req.user?.sub || 'system';
    return this.auditLogService.findByUser(userId, page || 1, limit || 10);
  }

  @Post()
  @ApiOperation({ summary: 'Create audit log entry (internal)' })
  async create(@Body() data: {
    action: AuditAction;
    entityType: string;
    entityId?: string;
    performedBy: string;
    performedByEmail: string;
    details?: any;
    ipAddress?: string;
  }) {
    return this.auditLogService.create(data);
  }

  // RabbitMQ event handlers for audit logging
  @EventPattern('audit.user_created')
  async handleUserCreated(@Payload() data: any) {
    await this.auditLogService.create({
      action: AuditAction.USER_CREATED,
      entityType: 'user',
      entityId: data.userId,
      performedBy: data.performedBy || 'system',
      performedByEmail: data.performedByEmail || 'system',
      details: data,
    });
  }

  @EventPattern('audit.role_changed')
  async handleRoleChanged(@Payload() data: any) {
    await this.auditLogService.create({
      action: AuditAction.ROLE_CHANGED,
      entityType: 'user',
      entityId: data.userId,
      performedBy: data.performedBy || 'system',
      performedByEmail: data.performedByEmail || 'system',
      details: data,
    });
  }

  @EventPattern('audit.user_status_changed')
  async handleUserStatusChanged(@Payload() data: any) {
    await this.auditLogService.create({
      action: data.isActive ? AuditAction.USER_ACTIVATED : AuditAction.USER_DEACTIVATED,
      entityType: 'user',
      entityId: data.userId,
      performedBy: data.performedBy || 'system',
      performedByEmail: data.performedByEmail || 'system',
      details: data,
    });
  }

  @EventPattern('audit.password_changed')
  async handlePasswordChanged(@Payload() data: any) {
    await this.auditLogService.create({
      action: AuditAction.PASSWORD_CHANGED,
      entityType: 'user',
      entityId: data.userId,
      performedBy: data.performedBy || 'system',
      performedByEmail: data.performedByEmail || 'system',
      details: data,
    });
  }

  @EventPattern('audit.password_reset')
  async handlePasswordReset(@Payload() data: any) {
    await this.auditLogService.create({
      action: AuditAction.PASSWORD_RESET,
      entityType: 'user',
      entityId: data.userId,
      performedBy: data.performedBy || 'system',
      performedByEmail: data.performedByEmail || 'system',
      details: data,
    });
  }
}
