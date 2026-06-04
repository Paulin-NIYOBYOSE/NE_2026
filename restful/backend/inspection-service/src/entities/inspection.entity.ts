import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InspectionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum InspectionResult {
  PASS = 'pass',
  FAIL = 'fail',
  NEEDS_MAINTENANCE = 'needs_maintenance',
}

@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  extinguisherId: string;

  @Column()
  inspectorId: string;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ type: 'enum', enum: InspectionStatus, default: InspectionStatus.SCHEDULED })
  status: InspectionStatus;

  @Column({ type: 'enum', enum: InspectionResult, nullable: true })
  result: InspectionResult;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  findings: string;

  @Column({ type: 'boolean', default: false })
  pressureCheck: boolean;

  @Column({ type: 'boolean', default: false })
  sealIntact: boolean;

  @Column({ type: 'boolean', default: false })
  pinPresent: boolean;

  @Column({ type: 'boolean', default: false })
  hosCondition: boolean;

  @Column({ type: 'boolean', default: false })
  labelReadable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
