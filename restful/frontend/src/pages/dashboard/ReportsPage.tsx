import { useEffect, useState } from 'react';
import { BarChart3, Download, FileText, Loader2, PlusCircle, Clock, User, Users } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { reportService } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { DashboardStats, Report, PaginatedResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'yearly', label: 'Yearly Report' },
  { value: 'expired_extinguishers', label: 'Expired Extinguishers' },
  { value: 'maintenance_history', label: 'Maintenance History' },
  { value: 'inspection_summary', label: 'Inspection Summary' },
];

const generateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['daily', 'monthly', 'yearly', 'expired_extinguishers', 'maintenance_history', 'inspection_summary'] as const),
  format: z.enum(['json', 'csv', 'pdf'] as const),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
});

type GenerateForm = z.infer<typeof generateSchema>;

export default function ReportsPage() {
  const { user } = useAuthStore();
  const canGenerateReport = ['admin', 'inspector'].includes(user?.role || '');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<PaginatedResponse<Report> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [showMyReports, setShowMyReports] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema) as any,
    defaultValues: { type: 'monthly', format: 'json' },
  });

  useEffect(() => {
    loadData();
  }, [showMyReports]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, reportsRes] = await Promise.all([
        reportService.getDashboard(),
        showMyReports ? reportService.getMyReports(1, 10) : reportService.getAll(1, 10),
      ]);
      setStats(dashRes.data);
      setReports(reportsRes.data);
    } catch {
      // Errors handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const onGenerateSubmit = async (data: GenerateForm) => {
    setGenerating(true);
    try {
      await reportService.generate(data);
      toast.success('Report generated successfully!');
      setShowForm(false);
      reset();
      loadData(); // Refresh report list
    } catch {
      // Error handled by interceptor
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCsv = async (reportId: string) => {
    setExporting(reportId);
    try {
      const res = await reportService.exportCsv(reportId);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const complianceData = [
    { name: 'Active', value: stats?.extinguishers.active || 0, color: '#10b981' },
    { name: 'Expired', value: stats?.extinguishers.expired || 0, color: '#ef4444' },
    { name: 'Maintenance', value: stats?.extinguishers.maintenance || 0, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const trendData = [
    { month: 'Jan', compliance: 78 },
    { month: 'Feb', compliance: 82 },
    { month: 'Mar', compliance: 79 },
    { month: 'Apr', compliance: 85 },
    { month: 'May', compliance: 88 },
    { month: 'Jun', compliance: 92 },
  ];

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all';

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="View system analytics and generate detailed reports"
        action={
          canGenerateReport ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Generate Report
            </button>
          ) : undefined
        }
      />

      {/* Generate Report Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate New Report</h3>
          <form onSubmit={handleSubmit(onGenerateSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Report Title *
                </label>
                <input
                  {...register('title')}
                  className={inputClass}
                  placeholder="e.g., Monthly Inspection Report - June 2025"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Report Type *
                </label>
                <select {...register('type')} className={inputClass}>
                  {REPORT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Format
                </label>
                <select {...register('format')} className={inputClass}>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period Start
                </label>
                <input {...register('periodStart')} type="date" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period End
                </label>
                <input {...register('periodEnd')} type="date" className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={generating}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); reset(); }}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Extinguishers" value={stats?.extinguishers.total || 0} icon={BarChart3} color="blue" />
        <StatCard title="Active" value={stats?.extinguishers.active || 0} icon={BarChart3} color="green" />
        <StatCard title="Expired" value={stats?.extinguishers.expired || 0} icon={BarChart3} color="red" />
        <StatCard title="In Maintenance" value={stats?.extinguishers.maintenance || 0} icon={BarChart3} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          {complianceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {complianceData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              No data available
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} domain={[70, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="compliance" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reports */}
      {reports && reports.data.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setShowMyReports(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  showMyReports
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                My Reports
              </button>
              <button
                onClick={() => setShowMyReports(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  !showMyReports
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                All Reports
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reports.data.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{report.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={report.type.replace(/_/g, ' ')} />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(report.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleExportCsv(report.id)}
                  disabled={exporting === report.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  {exporting === report.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Export CSV
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
