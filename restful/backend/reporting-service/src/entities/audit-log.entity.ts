import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ACTIVATED = 'user.activated',
  USER_DEACTIVATED = 'user.deactivated',
  ROLE_CHANGED = 'role.changed',
  PASSWORD_CHANGED = 'password.changed',
  PASSWORD_RESET = 'password.reset',
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  EXTINGUISHER_CREATED = 'extinguisher.created',
  EXTINGUISHER_UPDATED = 'extinguisher.updated',
  EXTINGUISHER_DELETED = 'extinguisher.deleted',
  INSPECTION_SCHEDULED = 'inspection.scheduled',
  INSPECTION_COMPLETED = 'inspection.completed',
  MAINTENANCE_LOGGED = 'maintenance.logged',
  REPORT_GENERATED = 'report.generated',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column()
  performedBy: string;

  @Column()
  performedByEmail: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
