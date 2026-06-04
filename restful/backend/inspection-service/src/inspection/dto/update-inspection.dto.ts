import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InspectionStatus, InspectionResult } from '../../entities/inspection.entity';

export class UpdateInspectionDto {
  @ApiPropertyOptional({ enum: InspectionStatus })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional({ enum: InspectionResult })
  @IsOptional()
  @IsEnum(InspectionResult)
  result?: InspectionResult;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pressureCheck?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sealIntact?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinPresent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hosCondition?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  labelReadable?: boolean;
}
