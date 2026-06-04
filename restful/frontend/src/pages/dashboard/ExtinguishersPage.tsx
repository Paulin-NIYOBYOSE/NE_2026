import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, FireExtinguisher, ChevronDown, Eye, Edit } from 'lucide-react';
import { extinguisherService } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { FireExtinguisher as ExtType, PaginatedResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';

const STATUS_OPTIONS = ['all', 'active', 'expired', 'maintenance', 'decommissioned'];
const TYPE_OPTIONS = ['all', 'water', 'foam', 'co2', 'dry_powder', 'wet_chemical'];

export default function ExtinguishersPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<PaginatedResponse<ExtType> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pick up search param from URL (e.g., from Navbar global search)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearch(urlSearch);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      const res = await extinguisherService.getAll(params);
      setData(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fire Extinguishers"
        description="Manage and track all fire extinguishers in your system"
        action={
          isAdmin && (
            <Link
              to="/dashboard/extinguishers/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Extinguisher
            </Link>
          )
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by serial number, location, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t === 'all' ? 'All types' : t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={FireExtinguisher}
          title="No extinguishers found"
          description={
            debouncedSearch || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No extinguishers match your filters.'
              : 'Start by adding your first fire extinguisher.'
          }
          action={
            !debouncedSearch && statusFilter === 'all' && typeFilter === 'all' ? (
              <Link to="/dashboard/extinguishers/add" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                <Plus className="h-4 w-4" /> Add Extinguisher
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.data.map((ext) => {
                    const expiring = (() => {
                      const days = Math.ceil((new Date(ext.expiryDate).getTime() - Date.now()) / (1000 * 86400));
                      return days > 0 && days <= 30;
                    })();
                    return (
                      <tr key={ext.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ext.serialNumber}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                          {ext.type.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[160px] truncate">
                          {ext.location}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={ext.status} /></td>
                        <td className="px-6 py-4">
                          <span className={expiring ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                            {formatDate(ext.expiryDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/dashboard/extinguishers/${ext.id}`)}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/extinguishers/${ext.id}/edit`)}
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {data.meta.totalPages > 1 && (
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
    </div>
  );
}
