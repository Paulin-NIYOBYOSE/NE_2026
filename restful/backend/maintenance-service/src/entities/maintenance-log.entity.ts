import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MaintenanceType {
  REFILL = 'refill',
  REPAIR = 'repair',
  REPLACEMENT = 'replacement',
  PRESSURE_TEST = 'pressure_test',
  GENERAL_SERVICE = 'general_service',
}

export enum MaintenanceCondition {
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
}

@Entity('maintenance_logs')
export class MaintenanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  extinguisherId: string;

  @Column()
  technicianId: string;

  @Column({ nullable: true })
  inspectionId: string;

  @Column({ type: 'enum', enum: MaintenanceType })
  maintenanceType: MaintenanceType;

  @Column({ type: 'enum', enum: MaintenanceCondition })
  conditionBefore: MaintenanceCondition;

  @Column({ type: 'enum', enum: MaintenanceCondition })
  conditionAfter: MaintenanceCondition;

  @Column()
  description: string;

  @Column({ nullable: true })
  partsReplaced: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'date' })
  maintenanceDate: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
