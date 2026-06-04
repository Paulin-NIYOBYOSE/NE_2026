import api from './axios';
import type {
  AuthResponse,
  PaginatedResponse,
  FireExtinguisher,
  Inspection,
  MaintenanceLog,
  User,
  DashboardStats,
  Report,
  Notification,
} from '@/types';

// Auth Service
export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  requestPasswordReset: (email: string) =>
    api.post('/auth/password-reset/request', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/password-reset/confirm', { token, newPassword }),
};

// User Service
export const userService = {
  getAll: (page = 1, limit = 10, search?: string) => {
    const params: any = { page, limit };
    if (search) params.search = search;
    return api.get<PaginatedResponse<User>>('/users', { params });
  },
  getById: (id: string) => api.get<User>(`/users/${id}`),
  getProfile: () => api.get<User>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put<User>('/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put('/users/profile/password', data),
  getInspectors: () => api.get<User[]>('/users/inspectors'),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
  activate: (id: string) => api.patch(`/users/${id}/activate`),
  changeRole: (id: string, role: string, reason?: string) =>
    api.patch(`/users/${id}/role`, { role, reason }),
  createRoleRequest: (requestedRole: string, reason: string) =>
    api.post('/users/role-requests', { requestedRole, reason }),
  getRoleRequests: (status?: string) => {
    const params: any = {};
    if (status) params.status = status;
    return api.get('/users/role-requests', { params });
  },
  getMyRoleRequests: () => api.get('/users/role-requests/my'),
  approveRoleRequest: (id: string, reviewNote?: string) =>
    api.patch(`/users/role-requests/${id}/approve`, { reviewNote }),
  rejectRoleRequest: (id: string, reviewNote?: string) =>
    api.patch(`/users/role-requests/${id}/reject`, { reviewNote }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Extinguisher Service
export const extinguisherService = {
  getAll: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<FireExtinguisher>>('/extinguishers', { params }),
  getById: (id: string) => api.get<FireExtinguisher>(`/extinguishers/${id}`),
  create: (data: Partial<FireExtinguisher>) => api.post<FireExtinguisher>('/extinguishers', data),
  update: (id: string, data: Partial<FireExtinguisher>) =>
    api.put<FireExtinguisher>(`/extinguishers/${id}`, data),
  delete: (id: string) => api.delete(`/extinguishers/${id}`),
  getStats: () => api.get('/extinguishers/stats'),
  getExpired: () => api.get<FireExtinguisher[]>('/extinguishers/expired'),
  getSelectOptions: () => api.get<FireExtinguisher[]>('/extinguishers/select-options'),
};

// Inspection Service
export const inspectionService = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Inspection>>(`/inspections?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<Inspection>(`/inspections/${id}`),
  create: (data: Partial<Inspection>) => api.post<Inspection>('/inspections', data),
  update: (id: string, data: Partial<Inspection>) => api.put<Inspection>(`/inspections/${id}`, data),
  cancel: (id: string) => api.patch(`/inspections/${id}/cancel`),
  getUpcoming: (days = 7) => api.get<Inspection[]>(`/inspections/upcoming?days=${days}`),
  getByInspector: (inspectorId: string) => api.get(`/inspections/inspector/${inspectorId}`),
  getByExtinguisher: (extinguisherId: string) => api.get(`/inspections/extinguisher/${extinguisherId}`),
};

// Maintenance Service
export const maintenanceService = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<MaintenanceLog>>(`/maintenance?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<MaintenanceLog>(`/maintenance/${id}`),
  create: (data: Partial<MaintenanceLog>) => api.post<MaintenanceLog>('/maintenance', data),
  getByExtinguisher: (extinguisherId: string) =>
    api.get<MaintenanceLog[]>(`/maintenance/extinguisher/${extinguisherId}`),
  getByTechnician: (technicianId: string) =>
    api.get(`/maintenance/technician/${technicianId}`),
};

// Reporting Service
export const reportService = {
  getDashboard: () => api.get<DashboardStats>('/reports/dashboard'),
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Report>>(`/reports?page=${page}&limit=${limit}`),
  getMyReports: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Report>>(`/reports/my?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<Report>(`/reports/${id}`),
  generate: (data: {
    title: string;
    type: string;
    format?: string;
    periodStart?: string;
    periodEnd?: string;
  }) => api.post<Report>('/reports', data),
  exportCsv: (id: string) => api.get(`/reports/${id}/export/csv`, { responseType: 'blob' }),
};

// Notification Service
export const notificationService = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Notification>>(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
};

// Audit Log Service
export const auditLogService = {
  getAll: (page = 1, limit = 10, filters?: { action?: string; entityType?: string; performedBy?: string }) => {
    const params: any = { page, limit };
    if (filters?.action) params.action = filters.action;
    if (filters?.entityType) params.entityType = filters.entityType;
    if (filters?.performedBy) params.performedBy = filters.performedBy;
    return api.get('/reports/audit-logs', { params });
  },
  getMyLogs: (page = 1, limit = 10) =>
    api.get(`/reports/audit-logs/my?page=${page}&limit=${limit}`),
};
