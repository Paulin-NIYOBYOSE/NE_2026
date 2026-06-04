import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInspectionDto {
  @ApiProperty({ description: 'Fire extinguisher ID' })
  @IsString()
  @IsNotEmpty()
  extinguisherId: string;

  @ApiProperty({ description: 'Inspector user ID' })
  @IsString()
  @IsNotEmpty()
  inspectorId: string;

  @ApiProperty({ example: '2024-06-15T10:00:00Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
