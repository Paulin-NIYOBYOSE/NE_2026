import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(data: {
    action: AuditAction;
    entityType: string;
    entityId?: string;
    performedBy: string;
    performedByEmail: string;
    details?: any;
    ipAddress?: string;
  }) {
    const log = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(log);
  }

  async findAll(page: number = 1, limit: number = 10, filters?: { action?: string; entityType?: string; performedBy?: string }) {
    const where: any = {};
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.performedBy) where.performedBy = filters.performedBy;

    const [data, total] = await this.auditLogRepository.findAndCount({
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

  async findByUser(userId: string, page: number = 1, limit: number = 10) {
    return this.findAll(page, limit, { performedBy: userId });
  }
}
