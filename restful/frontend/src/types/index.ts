export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'inspector' | 'technician' | 'user';
  isActive: boolean;
  phone?: string;
  address?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface FireExtinguisher {
  id: string;
  serialNumber: string;
  type: 'water' | 'foam' | 'co2' | 'dry_powder' | 'wet_chemical';
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
  lastInspectionDate: string | null;
  nextInspectionDate: string | null;
  location: string;
  building: string | null;
  floor: string | null;
  status: 'active' | 'expired' | 'maintenance' | 'decommissioned';
  weight: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  extinguisherId: string;
  inspectorId: string;
  scheduledDate: string;
  completedDate: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  result: 'pass' | 'fail' | 'needs_maintenance' | null;
  notes: string | null;
  findings: string | null;
  pressureCheck: boolean;
  sealIntact: boolean;
  pinPresent: boolean;
  hosCondition: boolean;
  labelReadable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: string;
  extinguisherId: string;
  technicianId: string;
  inspectionId: string | null;
  maintenanceType: 'refill' | 'repair' | 'replacement' | 'pressure_test' | 'general_service';
  conditionBefore: 'good' | 'fair' | 'poor' | 'critical';
  conditionAfter: 'good' | 'fair' | 'poor' | 'critical';
  description: string;
  partsReplaced: string | null;
  cost: number | null;
  maintenanceDate: string;
  nextMaintenanceDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  format: string;
  data: any;
  generatedBy: string;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'email' | 'system' | 'alert';
  recipient: string;
  recipientId: string | null;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  eventType: string | null;
  isRead: boolean;
  createdAt: string;
  sentAt: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RoleRequest {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  requestedRole: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  extinguishers: {
    total: number;
    active: number;
    expired: number;
    maintenance: number;
  };
  generatedAt: string;
}
