import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Loader2, Shield, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/api/services';
import PageHeader from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const roleRequestSchema = z.object({
  role: z.enum(['admin', 'inspector', 'technician', 'user']),
  reason: z.string().min(10, 'Please provide a reason with at least 10 characters'),
});

type RoleRequestForm = z.infer<typeof roleRequestSchema>;

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  inspector: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  technician: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [tab, setTab] = useState<'profile' | 'security' | 'role'>('profile');
  const [requestingRole, setRequestingRole] = useState(false);

  const roleRequestForm = useForm<RoleRequestForm>({
    resolver: zodResolver(roleRequestSchema),
    defaultValues: { role: 'inspector', reason: '' },
  });

  const onRoleRequestSubmit = async (data: RoleRequestForm) => {
    setRequestingRole(true);
    try {
      await userService.createRoleRequest(data.role, data.reason);
      toast.success('Role change request sent to administrators');
      roleRequestForm.reset();
    } catch {
      // Error handled by interceptor
    } finally {
      setRequestingRole(false);
    }
  };

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      department: user?.department || '',
      address: user?.address || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setSaving(true);
    const success = await updateProfile(data);
    setSaving(false);
    if (success) {
      profileForm.reset(data);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setChangingPwd(true);
    const success = await changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
    setChangingPwd(false);
    if (success) {
      passwordForm.reset();
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all';

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="My Profile" description="Manage your account settings and security" />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'profile'
              ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <User className="h-4 w-4" /> Profile
        </button>
        <button
          onClick={() => setTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'security'
              ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Lock className="h-4 w-4" /> Security
        </button>
        <button
          onClick={() => setTab('role')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'role'
              ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Send className="h-4 w-4" /> Role Request
        </button>
      </div>

      {tab === 'profile' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user?.email}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user?.role || 'user']}`}>
                <Shield className="h-3 w-3" />
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input {...profileForm.register('firstName')} className={inputClass} />
                {profileForm.formState.errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input {...profileForm.register('lastName')} className={inputClass} />
                {profileForm.formState.errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  value={user?.email || ''}
                  type="email"
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  {...profileForm.register('phone')}
                  className={inputClass}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  {...profileForm.register('department')}
                  className={inputClass}
                  placeholder="Safety Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  {...profileForm.register('address')}
                  className={inputClass}
                  placeholder="123 Main St, City"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Change Password</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Use a strong password with at least 6 characters, including letters and numbers.
          </p>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                {...passwordForm.register('currentPassword')}
                type="password"
                className={inputClass}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                {...passwordForm.register('newPassword')}
                type="password"
                className={inputClass}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                {...passwordForm.register('confirmPassword')}
                type="password"
                className={inputClass}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPwd}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {changingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
                {changingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'role' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Request Role Change</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Submit a request to change your current role. An administrator will review and approve or deny your request.
          </p>

          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current role:</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[user?.role || 'user']}`}>
              <Shield className="h-3 w-3" />
              {user?.role}
            </span>
          </div>

          <form onSubmit={roleRequestForm.handleSubmit(onRoleRequestSubmit)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requested Role
              </label>
              <select
                {...roleRequestForm.register('role')}
                className={inputClass}
              >
                <option value="inspector">Inspector</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              {roleRequestForm.formState.errors.role && (
                <p className="text-red-500 text-xs mt-1">{roleRequestForm.formState.errors.role.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for Request
              </label>
              <textarea
                {...roleRequestForm.register('reason')}
                className={inputClass}
                rows={4}
                placeholder="Explain why you need this role change..."
              />
              {roleRequestForm.formState.errors.reason && (
                <p className="text-red-500 text-xs mt-1">{roleRequestForm.formState.errors.reason.message}</p>
              )}
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={requestingRole}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {requestingRole && <Loader2 className="h-4 w-4 animate-spin" />}
                {requestingRole ? 'Sending...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
