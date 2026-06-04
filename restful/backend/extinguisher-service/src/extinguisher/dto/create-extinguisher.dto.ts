import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExtinguisherType } from '../../entities/fire-extinguisher.entity';

export class CreateExtinguisherDto {
  @ApiProperty({ example: 'FE-2024-001' })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ enum: ExtinguisherType })
  @IsEnum(ExtinguisherType)
  type: ExtinguisherType;

  @ApiProperty({ example: 'FireGuard Inc.' })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  manufacturingDate: string;

  @ApiProperty({ example: '2029-01-15' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ example: 'Building A, Floor 2, Room 201' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: 'Building A' })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ example: '2' })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  weight: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
