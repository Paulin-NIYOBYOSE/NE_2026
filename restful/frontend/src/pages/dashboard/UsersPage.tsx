import { useEffect, useState, useCallback } from 'react';
import { Users, Search, UserCheck, UserX, Shield, Plus, Loader2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '@/api/services';
import type { User, PaginatedResponse, RoleRequest } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/api/axios';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  inspector: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  technician: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const createUserSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
  role: z.enum(['admin', 'inspector', 'technician', 'user']),
});
type CreateUserForm = z.infer<typeof createUserSchema>;

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'role-requests'>('users');
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);

  // Role request state
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [roleRequestsLoading, setRoleRequestsLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'user' },
  });

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAll(page, 10, debouncedSearch || undefined);
      setData(res.data);
    } catch {
      // Errors handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchRoleRequests = useCallback(async () => {
    setRoleRequestsLoading(true);
    try {
      const res = await userService.getRoleRequests('pending');
      setRoleRequests(res.data.data || []);
    } catch {
      // handled by interceptor
    } finally {
      setRoleRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'role-requests') {
      fetchRoleRequests();
    }
  }, [activeTab, fetchRoleRequests]);

  const handleApproveRequest = async (request: RoleRequest) => {
    setProcessingRequestId(request.id);
    try {
      await userService.approveRoleRequest(request.id, 'Approved by admin');
      toast.success(`Approved ${request.firstName}'s role request`);
      fetchRoleRequests();
    } catch {
      // handled
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (request: RoleRequest) => {
    setProcessingRequestId(request.id);
    try {
      await userService.rejectRoleRequest(request.id, 'Rejected by admin');
      toast.success(`Rejected ${request.firstName}'s role request`);
      fetchRoleRequests();
    } catch {
      // handled
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setTogglingId(user.id);
    try {
      if (user.isActive) {
        await userService.deactivate(user.id);
        toast.success(`${user.firstName} deactivated`);
      } else {
        await userService.activate(user.id);
        toast.success(`${user.firstName} activated`);
      }
      fetchData();
    } catch {
      // Error handled by interceptor
    } finally {
      setTogglingId(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string, userName: string) => {
    setChangingRoleId(userId);
    setRoleDropdownOpen(null);
    try {
      await userService.changeRole(userId, newRole, 'Admin role change');
      toast.success(`${userName}'s role changed to ${newRole}`);
      fetchData();
    } catch {
      // Error handled by interceptor
    } finally {
      setChangingRoleId(null);
    }
  };

  const onCreateSubmit = async (formData: CreateUserForm) => {
    setCreating(true);
    try {
      await api.post('/auth/admin/create-privileged', formData);
      toast.success(`${formData.role} account created successfully`);
      setShowCreateForm(false);
      reset();
      fetchData();
    } catch {
      // Error handled by interceptor
    } finally {
      setCreating(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm';

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage system users, roles and access permissions"
        action={
          activeTab === 'users' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'users'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('role-requests')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'role-requests'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Role Requests
          {roleRequests.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1 text-xs font-medium bg-amber-500 text-white rounded-full">
              {roleRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Create User Form */}
      {activeTab === 'users' && showCreateForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Create Privileged Account</h3>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input {...register('firstName')} className={inputClass} placeholder="John" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input {...register('lastName')} className={inputClass} placeholder="Doe" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input {...register('email')} type="email" className={inputClass} placeholder="john@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input {...register('password')} type="password" className={inputClass} placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select {...register('role')} className={inputClass}>
                  <option value="user">User</option>
                  <option value="inspector">Inspector</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm transition-colors"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? 'Creating...' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); reset(); }}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>
        {data && (
          <p className="text-sm text-gray-500 whitespace-nowrap">
            {data.meta.total} user{data.meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {activeTab === 'users' && (
        <>
          {loading ? (
            <LoadingSpinner size="lg" className="min-h-[40vh]" />
          ) : !data?.data?.length ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={debouncedSearch ? `No users match "${debouncedSearch}"` : 'No users in the system yet.'}
            />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.data.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setRoleDropdownOpen(roleDropdownOpen === user.id ? null : user.id)}
                              disabled={changingRoleId === user.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-opacity disabled:opacity-50 ${roleColors[user.role] || roleColors.user}`}
                            >
                              <Shield className="h-3 w-3" />
                              {changingRoleId === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  {user.role}
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                            {roleDropdownOpen === user.id && (
                              <div className="absolute z-10 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                {(['admin', 'inspector', 'technician', 'user'] as const).map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => handleChangeRole(user.id, role, `${user.firstName} ${user.lastName}`)}
                                    className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                      user.role === role ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.isActive ? 'active' : 'decommissioned'} />
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingId === user.id}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            {togglingId === user.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : user.isActive ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Role Requests Tab */}
      {activeTab === 'role-requests' && (
        <>
          {roleRequestsLoading ? (
            <LoadingSpinner size="lg" className="min-h-[40vh]" />
          ) : roleRequests.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No pending role requests"
              description="All role change requests have been processed."
            />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current → Requested</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {roleRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {req.firstName?.[0]?.toUpperCase()}{req.lastName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{req.firstName} {req.lastName}</p>
                              <p className="text-xs text-gray-400">{req.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[req.currentRole] || roleColors.user}`}>
                              {req.currentRole}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[req.requestedRole] || roleColors.user}`}>
                              {req.requestedRole}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {req.reason || <span className="text-gray-400 italic">No reason provided</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(req)}
                              disabled={processingRequestId === req.id}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                            >
                              {processingRequestId === req.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req)}
                              disabled={processingRequestId === req.id}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            >
                              {processingRequestId === req.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserX className="h-3.5 w-3.5" />
                              )}
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
