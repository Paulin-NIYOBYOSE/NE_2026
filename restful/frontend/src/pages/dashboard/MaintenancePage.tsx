import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wrench, Search, ChevronDown } from 'lucide-react';
import { maintenanceService } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { MaintenanceLog, PaginatedResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';

const TYPE_OPTIONS = ['all', 'refill', 'repair', 'replacement', 'pressure_test', 'general_service'];

export default function MaintenancePage() {
  const { user } = useAuthStore();
  const canAddMaintenance = ['admin', 'inspector', 'technician'].includes(user?.role || '');
  const [data, setData] = useState<PaginatedResponse<MaintenanceLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await maintenanceService.getAll(page, 15);
      setData(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = (data?.data || []).filter((m) => {
    const matchesSearch =
      !search ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.maintenanceType.includes(search.toLowerCase()) ||
      m.extinguisherId.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.maintenanceType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Logs"
        description="Track all maintenance activities for fire extinguishers"
        action={
          canAddMaintenance && (
            <Link
              to="/dashboard/maintenance/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Log Maintenance
            </Link>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by description or extinguisher ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'All types' : t.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance logs"
          description="Log your first maintenance action to get started."
          action={
            <Link
              to="/dashboard/maintenance/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              <Plus className="h-4 w-4" /> Log Maintenance
            </Link>
          }
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Extinguisher</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="capitalize font-medium text-gray-900 dark:text-white">
                        {m.maintenanceType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                      {m.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {m.extinguisherId.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={m.conditionBefore} />
                        <span className="text-gray-400 text-xs">→</span>
                        <StatusBadge status={m.conditionAfter} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(m.maintenanceDate)}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                      {m.cost != null ? `$${Number(m.cost).toFixed(2)}` : '—'}
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
    </div>
  );
}
