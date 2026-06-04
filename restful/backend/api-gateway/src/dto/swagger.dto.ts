import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Auth DTOs ───────────────────────────────────────────────

export class LoginDto {
  @ApiProperty({ example: 'admin@tzw.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: 'Admin123!', description: 'User password' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  lastName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password (min 6 characters)' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...', description: 'Refresh token' })
  refreshToken: string;
}

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'user@tzw.com', description: 'Email address to send reset link' })
  email: string;
}

export class ConfirmPasswordResetDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...', description: 'Reset token from email' })
  token: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'New password' })
  newPassword: string;
}

export class CreatePrivilegedUserDto {
  @ApiProperty({ example: 'Jane', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name' })
  lastName: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password' })
  password: string;

  @ApiProperty({ example: 'inspector', description: 'Role', enum: ['admin', 'inspector', 'technician'] })
  role: string;
}

// ── User DTOs ───────────────────────────────────────────────

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Email address' })
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', description: 'Current password' })
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword456!', description: 'New password' })
  newPassword: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane', description: 'First name' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'jane@example.com', description: 'Email address' })
  email?: string;

  @ApiPropertyOptional({ example: true, description: 'Active status' })
  isActive?: boolean;
}

export class ChangeRoleDto {
  @ApiProperty({ example: 'inspector', description: 'New role', enum: ['admin', 'inspector', 'technician', 'user'] })
  role: string;

  @ApiPropertyOptional({ example: 'Promoted to inspector', description: 'Reason for role change' })
  reason?: string;
}

export class CreateRoleRequestDto {
  @ApiProperty({ example: 'inspector', description: 'Requested role', enum: ['admin', 'inspector', 'technician', 'user'] })
  requestedRole: string;

  @ApiPropertyOptional({ example: 'I need to perform inspections', description: 'Reason for request' })
  reason?: string;
}

export class ReviewRoleRequestDto {
  @ApiPropertyOptional({ example: 'Approved for inspection duties', description: 'Review note' })
  reviewNote?: string;
}

// ── Extinguisher DTOs ───────────────────────────────────────

export class CreateExtinguisherDto {
  @ApiProperty({ example: 'ABC-001', description: 'Serial number' })
  serialNumber: string;

  @ApiProperty({ example: 'ABC Dry Chemical', description: 'Extinguisher type' })
  type: string;

  @ApiProperty({ example: 'Main Office', description: 'Location' })
  location: string;

  @ApiProperty({ example: '2024-01-15', description: 'Manufacture date (YYYY-MM-DD)' })
  manufactureDate: string;

  @ApiProperty({ example: '2025-01-15', description: 'Expiry date (YYYY-MM-DD)' })
  expiryDate: string;

  @ApiProperty({ example: 5, description: 'Capacity in kg' })
  capacity: number;

  @ApiProperty({ example: 'active', description: 'Status', enum: ['active', 'expired', 'maintenance', 'decommissioned'] })
  status: string;

  @ApiPropertyOptional({ example: 'Warehouse A', description: 'Additional notes' })
  notes?: string;
}

export class UpdateExtinguisherDto {
  @ApiPropertyOptional({ example: 'ABC-001-Updated', description: 'Serial number' })
  serialNumber?: string;

  @ApiPropertyOptional({ example: 'CO2', description: 'Extinguisher type' })
  type?: string;

  @ApiPropertyOptional({ example: 'Building B', description: 'Location' })
  location?: string;

  @ApiPropertyOptional({ example: '2024-06-01', description: 'Manufacture date (YYYY-MM-DD)' })
  manufactureDate?: string;

  @ApiPropertyOptional({ example: '2025-06-01', description: 'Expiry date (YYYY-MM-DD)' })
  expiryDate?: string;

  @ApiPropertyOptional({ example: 10, description: 'Capacity in kg' })
  capacity?: number;

  @ApiPropertyOptional({ example: 'maintenance', description: 'Status', enum: ['active', 'expired', 'maintenance', 'decommissioned'] })
  status?: string;

  @ApiPropertyOptional({ example: 'Moved to new location', description: 'Additional notes' })
  notes?: string;
}

// ── Inspection DTOs ───────────────────────────────────────

export class CreateInspectionDto {
  @ApiProperty({ example: 'uuid-of-extinguisher', description: 'Extinguisher ID' })
  extinguisherId: string;

  @ApiProperty({ example: 'uuid-of-inspector', description: 'Inspector user ID' })
  inspectorId: string;

  @ApiProperty({ example: '2024-06-15', description: 'Scheduled date (YYYY-MM-DD)' })
  scheduledDate: string;

  @ApiPropertyOptional({ example: 'Annual inspection', description: 'Inspection type' })
  inspectionType?: string;

  @ApiPropertyOptional({ example: 'Check pressure gauge', description: 'Notes' })
  notes?: string;
}

export class UpdateInspectionDto {
  @ApiPropertyOptional({ example: 'uuid-of-extinguisher', description: 'Extinguisher ID' })
  extinguisherId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-inspector', description: 'Inspector user ID' })
  inspectorId?: string;

  @ApiPropertyOptional({ example: '2024-07-01', description: 'Scheduled date (YYYY-MM-DD)' })
  scheduledDate?: string;

  @ApiPropertyOptional({ example: 'completed', description: 'Status', enum: ['pending', 'completed', 'cancelled'] })
  status?: string;

  @ApiPropertyOptional({ example: 'passed', description: 'Result', enum: ['passed', 'failed', 'n/a'] })
  result?: string;

  @ApiPropertyOptional({ example: 'All checks passed', description: 'Notes' })
  notes?: string;
}

// ── Maintenance DTOs ─────────────────────────────────────

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'uuid-of-extinguisher', description: 'Extinguisher ID' })
  extinguisherId: string;

  @ApiProperty({ example: 'uuid-of-technician', description: 'Technician user ID' })
  technicianId: string;

  @ApiProperty({ example: '2024-06-10', description: 'Maintenance date (YYYY-MM-DD)' })
  maintenanceDate: string;

  @ApiProperty({ example: 'Recharged and replaced hose', description: 'Description of work done' })
  description: string;

  @ApiPropertyOptional({ example: 150.0, description: 'Cost in local currency' })
  cost?: number;

  @ApiPropertyOptional({ example: '2025-06-10', description: 'Next maintenance date (YYYY-MM-DD)' })
  nextMaintenanceDate?: string;
}

// ── Report DTOs ─────────────────────────────────────────────

export class GenerateReportDto {
  @ApiProperty({ example: 'extinguisher_summary', description: 'Report type', enum: ['extinguisher_summary', 'inspection_report', 'maintenance_report', 'compliance_report'] })
  type: string;

  @ApiProperty({ example: 'pdf', description: 'Output format', enum: ['pdf', 'csv', 'json'] })
  format: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Period start date (YYYY-MM-DD)' })
  periodStart?: string;

  @ApiPropertyOptional({ example: '2024-06-30', description: 'Period end date (YYYY-MM-DD)' })
  periodEnd?: string;
}

// ── Generic ID param ────────────────────────────────────────

export class IdParamDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID identifier' })
  id: string;
}
