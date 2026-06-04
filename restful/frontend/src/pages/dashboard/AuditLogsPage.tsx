import { useEffect, useState } from 'react';
import { ClipboardList, Filter, Loader2 } from 'lucide-react';
import { auditLogService } from '@/api/services';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDateTime } from '@/lib/utils';

const actionLabels: Record<string, string> = {
  'user.created': 'User Created',
  'user.updated': 'User Updated',
  'user.deleted': 'User Deleted',
  'user.activated': 'User Activated',
  'user.deactivated': 'User Deactivated',
  'role.changed': 'Role Changed',
  'password.changed': 'Password Changed',
  'password.reset': 'Password Reset',
  'auth.login': 'Login',
  'auth.logout': 'Logout',
};

const actionColors: Record<string, string> = {
  'user.created': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'user.updated': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'user.deleted': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'user.activated': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'user.deactivated': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'role.changed': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'password.changed': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'password.reset': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  'auth.login': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'auth.logout': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => { fetchData(); }, [page, actionFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAll(page, 10, actionFilter ? { action: actionFilter } : undefined);
      setLogs(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotal(res.data.meta.total);
    } catch {
      // Errors handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return '-';
    const parts: string[] = [];
    if (details.oldRole && details.newRole) parts.push(`${details.oldRole} → ${details.newRole}`);
    if (details.reason) parts.push(`Reason: ${details.reason}`);
    if (details.email) parts.push(details.email);
    return parts.length ? parts.join(' | ') : JSON.stringify(details).slice(0, 60);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all sensitive system actions and changes" />

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm border-none outline-none text-gray-700 dark:text-gray-300"
        >
          <option value="">All Actions</option>
          <option value="user.created">User Created</option>
          <option value="user.updated">User Updated</option>
          <option value="user.activated">User Activated</option>
          <option value="user.deactivated">User Deactivated</option>
          <option value="role.changed">Role Changed</option>
          <option value="password.changed">Password Changed</option>
          <option value="auth.login">Login</option>
        </select>
        <p className="text-sm text-gray-500 ml-auto">{total} total entries</p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : !logs.length ? (
        <EmptyState icon={ClipboardList} title="No audit logs" description="No audit entries found for the selected filter." />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">By</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 uppercase">{log.entityType}</span>
                      {log.entityId && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{log.entityId.slice(0, 8)}...</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs max-w-xs truncate">
                      {formatDetails(log.details)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-700 dark:text-gray-300">{log.performedByEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
