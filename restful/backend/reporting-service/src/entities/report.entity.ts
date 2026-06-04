import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ReportType {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  EXPIRED_EXTINGUISHERS = 'expired_extinguishers',
  MAINTENANCE_HISTORY = 'maintenance_history',
  INSPECTION_SUMMARY = 'inspection_summary',
}

export enum ReportFormat {
  JSON = 'json',
  PDF = 'pdf',
  CSV = 'csv',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.JSON })
  format: ReportFormat;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ nullable: true })
  filePath: string;

  @Column()
  generatedBy: string;

  @Column({ type: 'date', nullable: true })
  periodStart: Date;

  @Column({ type: 'date', nullable: true })
  periodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;
}
