import { PartialType } from '@nestjs/swagger';
import { CreateExtinguisherDto } from './create-extinguisher.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExtinguisherStatus } from '../../entities/fire-extinguisher.entity';

export class UpdateExtinguisherDto extends PartialType(CreateExtinguisherDto) {
  @ApiPropertyOptional({ enum: ExtinguisherStatus })
  @IsOptional()
  @IsEnum(ExtinguisherStatus)
  status?: ExtinguisherStatus;
}
