import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FireExtinguisher, ClipboardCheck, Wrench, AlertTriangle, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatusBadge from '@/components/shared/StatusBadge';
import { reportService, inspectionService, maintenanceService } from '@/api/services';
import type { DashboardStats, Inspection, MaintenanceLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, inspRes, maintRes] = await Promise.allSettled([
          reportService.getDashboard(),
          inspectionService.getAll(1, 5),
          maintenanceService.getAll(1, 5),
        ]);
        if (dashRes.status === 'fulfilled') setStats(dashRes.value.data);
        if (inspRes.status === 'fulfilled') setRecentInspections(inspRes.value.data?.data || []);
        if (maintRes.status === 'fulfilled') setRecentMaintenance(maintRes.value.data?.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const pieData = [
    { name: 'Active', value: stats?.extinguishers?.active || 0, color: '#10b981' },
    { name: 'Expired', value: stats?.extinguishers?.expired || 0, color: '#ef4444' },
    { name: 'Maintenance', value: stats?.extinguishers?.maintenance || 0, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const barData = [
    { month: 'Jan', inspections: 12, maintenance: 8 },
    { month: 'Feb', inspections: 19, maintenance: 11 },
    { month: 'Mar', inspections: 15, maintenance: 9 },
    { month: 'Apr', inspections: 22, maintenance: 14 },
    { month: 'May', inspections: 18, maintenance: 12 },
    { month: 'Jun', inspections: 25, maintenance: 16 },
  ];

  const total = stats?.extinguishers?.total || 0;
  const active = stats?.extinguishers?.active || 0;
  const complianceRate = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Here&apos;s your fire safety system overview for today.
            </p>
          </div>
          {/* <div className="flex items-center gap-3 bg-white/20 rounded-xl px-5 py-3">
            <TrendingUp className="h-6 w-6" />
            <div>
              <p className="text-sm text-blue-100">Compliance Rate</p>
              <p className="text-2xl font-bold">{complianceRate}%</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Extinguishers"
          value={stats?.extinguishers?.total || 0}
          icon={FireExtinguisher}
          color="blue"
        />
        <StatCard
          title="Active"
          value={stats?.extinguishers?.active || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Expired"
          value={stats?.extinguishers?.expired || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="In Maintenance"
          value={stats?.extinguishers?.maintenance || 0}
          icon={Wrench}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Legend />
              <Bar dataKey="inspections" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Inspections" />
              <Bar dataKey="maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Maintenance" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Extinguisher Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[240px] text-gray-400">
              <FireExtinguisher className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No extinguishers registered yet</p>
              <Link
                to="/dashboard/extinguishers/add"
                className="mt-3 text-blue-600 text-sm hover:underline"
              >
                Add first extinguisher
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inspections */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-500" /> Recent Inspections
            </h3>
            <Link
              to="/dashboard/inspections"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {recentInspections.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">No inspections yet</p>
              <Link to="/dashboard/inspections/add" className="text-blue-600 text-sm hover:underline mt-1 block">
                Schedule first inspection
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              {recentInspections.map((ins) => (
                <div
                  key={ins.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {ins.extinguisherId.slice(0, 12)}…
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {formatDate(ins.scheduledDate)}
                    </div>
                  </div>
                  <StatusBadge status={ins.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-500" /> Recent Maintenance
            </h3>
            <Link
              to="/dashboard/maintenance"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {recentMaintenance.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">No maintenance logged yet</p>
              <Link to="/dashboard/maintenance/add" className="text-blue-600 text-sm hover:underline mt-1 block">
                Log first maintenance
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              {recentMaintenance.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {m.maintenanceType.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                      {m.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={m.conditionAfter} />
                    <span className="text-xs text-gray-400">{formatDate(m.maintenanceDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
