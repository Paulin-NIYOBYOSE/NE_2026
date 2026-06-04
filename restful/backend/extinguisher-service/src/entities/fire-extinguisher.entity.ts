import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExtinguisherStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  MAINTENANCE = 'maintenance',
  DECOMMISSIONED = 'decommissioned',
}

export enum ExtinguisherType {
  WATER = 'water',
  FOAM = 'foam',
  CO2 = 'co2',
  DRY_POWDER = 'dry_powder',
  WET_CHEMICAL = 'wet_chemical',
}

@Entity('fire_extinguishers')
export class FireExtinguisher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column({ type: 'enum', enum: ExtinguisherType })
  type: ExtinguisherType;

  @Column()
  manufacturer: string;

  @Column({ type: 'date' })
  manufacturingDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  lastInspectionDate: Date;

  @Column({ type: 'date', nullable: true })
  nextInspectionDate: Date;

  @Column()
  location: string;

  @Column({ nullable: true })
  building: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ type: 'enum', enum: ExtinguisherStatus, default: ExtinguisherStatus.ACTIVE })
  status: ExtinguisherStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
