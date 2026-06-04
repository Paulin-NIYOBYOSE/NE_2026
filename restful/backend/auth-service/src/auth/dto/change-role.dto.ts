import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class ChangeRoleDto {
  @ApiProperty({ enum: UserRole, example: 'inspector' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({ example: 'Promoted after certification' })
  @IsString()
  @IsOptional()
  reason?: string;
}
