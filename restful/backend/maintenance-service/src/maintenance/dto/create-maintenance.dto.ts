import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceType, MaintenanceCondition } from '../../entities/maintenance-log.entity';

export class CreateMaintenanceDto {
  @ApiProperty({ description: 'Fire extinguisher ID' })
  @IsString()
  @IsNotEmpty()
  extinguisherId: string;

  @ApiProperty({ description: 'Technician user ID' })
  @IsString()
  @IsNotEmpty()
  technicianId: string;

  @ApiPropertyOptional({ description: 'Related inspection ID' })
  @IsOptional()
  @IsString()
  inspectionId?: string;

  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @ApiProperty({ enum: MaintenanceCondition })
  @IsEnum(MaintenanceCondition)
  conditionBefore: MaintenanceCondition;

  @ApiProperty({ enum: MaintenanceCondition })
  @IsEnum(MaintenanceCondition)
  conditionAfter: MaintenanceCondition;

  @ApiProperty({ example: 'Refilled CO2 canister and replaced hose' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Hose, Nozzle' })
  @IsOptional()
  @IsString()
  partsReplaced?: string;

  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  maintenanceDate: string;

  @ApiPropertyOptional({ example: '2025-06-15' })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;
}
