import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from '../entities/notification.entity';
import { EmailService } from './email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly MAX_RETRIES = 3;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly emailService: EmailService,
  ) {}

  async handleUserCreated(data: { userId: string; email: string; firstName: string; lastName: string }) {
    this.logger.log(`Processing user.created event for ${data.email}`);

    const notification = await this.createNotification({
      type: NotificationType.EMAIL,
      recipient: data.email,
      subject: 'Welcome to Fire Extinguisher Management System',
      body: `Welcome ${data.firstName}! Your account has been created.`,
      eventType: 'user.created',
    });

    const sent = await this.emailService.sendWelcomeEmail(data.email, data.firstName);
    await this.updateNotificationStatus(notification.id, sent);
  }

  async handleInspectionScheduled(data: {
    inspectionId: string;
    extinguisherId: string;
    inspectorId: string;
    scheduledDate: string;
  }) {
    this.logger.log(`Processing inspection.scheduled event for inspection ${data.inspectionId}`);

    const notification = await this.createNotification({
      type: NotificationType.EMAIL,
      recipient: data.inspectorId,
      subject: 'New Inspection Assigned',
      body: `You have been assigned a new inspection for extinguisher ${data.extinguisherId} on ${data.scheduledDate}`,
      eventType: 'inspection.scheduled',
    });

    // In production, you'd look up the inspector's email
    await this.updateNotificationStatus(notification.id, true);
  }

  async handleMaintenanceLogged(data: {
    maintenanceId: string;
    extinguisherId: string;
    technicianId: string;
    description: string;
  }) {
    this.logger.log(`Processing maintenance.logged event for ${data.maintenanceId}`);

    await this.createNotification({
      type: NotificationType.SYSTEM,
      recipient: 'admin',
      subject: 'Maintenance Action Logged',
      body: `Maintenance logged for extinguisher ${data.extinguisherId}: ${data.description}`,
      eventType: 'maintenance.logged',
    });
  }

  async handlePasswordResetRequested(data: {
    userId: string;
    email: string;
    resetToken: string;
    firstName: string;
  }) {
    this.logger.log(`Processing password.reset.requested for ${data.email}`);

    const notification = await this.createNotification({
      type: NotificationType.EMAIL,
      recipient: data.email,
      subject: 'Password Reset Request',
      body: `Password reset requested for ${data.email}`,
      eventType: 'password.reset.requested',
    });

    const sent = await this.emailService.sendPasswordResetEmail(
      data.email,
      data.firstName,
      data.resetToken,
    );
    await this.updateNotificationStatus(notification.id, sent);
  }

  async handleRoleRequestCreated(data: {
    requestId: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    currentRole: string;
    requestedRole: string;
    reason?: string;
  }) {
    this.logger.log(`Processing role.request.created for ${data.email}`);

    // Notify user: confirmation
    await this.createNotificationDirect({
      type: NotificationType.SYSTEM,
      recipient: data.email,
      recipientId: data.userId,
      subject: 'Role Change Request Submitted',
      body: `Your request to change role from ${data.currentRole} to ${data.requestedRole} has been submitted and is pending admin review.${data.reason ? ` Reason: ${data.reason}` : ''}`,
      eventType: 'role.request.created',
      isRead: false,
    });

    // Notify admin: alert (no recipientId so it shows in admin findAll)
    await this.createNotificationDirect({
      type: NotificationType.SYSTEM,
      recipient: 'admin',
      subject: `New Role Request: ${data.firstName} ${data.lastName}`,
      body: `User ${data.firstName} ${data.lastName} (${data.email}) has requested a role change from ${data.currentRole} to ${data.requestedRole}.${data.reason ? ` Reason: ${data.reason}` : ''}`,
      eventType: 'role.request.created',
      isRead: false,
    });
  }

  async handleRoleRequestApproved(data: {
    requestId: string;
    userId: string;
    email: string;
    firstName: string;
    newRole: string;
    reviewNote?: string;
  }) {
    this.logger.log(`Processing role.request.approved for ${data.email}`);

    await this.createNotificationDirect({
      type: NotificationType.SYSTEM,
      recipient: data.email,
      recipientId: data.userId,
      subject: 'Role Change Request Approved',
      body: `Your role change request has been approved. Your new role is ${data.newRole}.${data.reviewNote ? ` Note: ${data.reviewNote}` : ''}`,
      eventType: 'role.request.approved',
      isRead: false,
    });
  }

  async handleRoleRequestRejected(data: {
    requestId: string;
    userId: string;
    email: string;
    firstName: string;
    requestedRole: string;
    reviewNote?: string;
  }) {
    this.logger.log(`Processing role.request.rejected for ${data.email}`);

    await this.createNotificationDirect({
      type: NotificationType.SYSTEM,
      recipient: data.email,
      recipientId: data.userId,
      subject: 'Role Change Request Rejected',
      body: `Your request to change role to ${data.requestedRole} has been rejected.${data.reviewNote ? ` Reason: ${data.reviewNote}` : ''}`,
      eventType: 'role.request.rejected',
      isRead: false,
    });
  }

  async findAll(page: number = 1, limit: number = 10, recipientId?: string) {
    const where: any = {};
    if (recipientId) {
      where.recipientId = recipientId;
    }

    const [data, total] = await this.notificationRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10) {
    return this.findAll(page, limit, userId);
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string) {
    await this.notificationRepository.update(id, { isRead: true });
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );
    return { message: 'All notifications marked as read' };
  }

  async createNotificationDirect(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  private async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  private async updateNotificationStatus(id: string, success: boolean) {
    const status = success ? NotificationStatus.SENT : NotificationStatus.FAILED;
    await this.notificationRepository.update(id, {
      status,
      sentAt: success ? new Date() : null,
    });
  }
}
