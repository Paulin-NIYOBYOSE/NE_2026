import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardCheck, Search, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { inspectionService } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { Inspection, PaginatedResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'];

export default function InspectionsPage() {
  const { user } = useAuthStore();
  const canAddInspection = ['admin', 'inspector'].includes(user?.role || '');
  const [data, setData] = useState<PaginatedResponse<Inspection> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inspectionService.getAll(page, 15);
      setData(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this inspection?')) return;
    setCancelling(id);
    try {
      await inspectionService.cancel(id);
      toast.success('Inspection cancelled');
      fetchData();
    } catch {
      // handled
    } finally {
      setCancelling(null);
    }
  };

  const filtered = (data?.data || []).filter((i) => {
    const matchesSearch =
      !search ||
      i.extinguisherId.toLowerCase().includes(search.toLowerCase()) ||
      i.inspectorId.toLowerCase().includes(search.toLowerCase()) ||
      i.status.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections"
        description="Schedule and track fire extinguisher inspections"
        action={
          canAddInspection && (
            <Link
              to="/dashboard/inspections/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Schedule Inspection
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
            placeholder="Search by extinguisher or inspector ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No inspections found"
          description="Schedule your first inspection to get started."
          action={
            <Link
              to="/dashboard/inspections/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              <Plus className="h-4 w-4" /> Schedule Inspection
            </Link>
          }
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Extinguisher</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((ins) => (
                  <tr key={ins.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                      {ins.extinguisherId.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                      {ins.inspectorId.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(ins.scheduledDate)}</td>
                    <td className="px-6 py-4"><StatusBadge status={ins.status} /></td>
                    <td className="px-6 py-4">
                      {ins.result ? <StatusBadge status={ins.result} /> : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[180px] truncate text-xs">
                      {ins.notes || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {ins.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancel(ins.id)}
                          disabled={cancelling === ins.id}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
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
