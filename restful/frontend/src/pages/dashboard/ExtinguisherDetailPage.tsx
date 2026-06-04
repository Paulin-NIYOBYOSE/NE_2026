import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, ClipboardCheck, Wrench, AlertTriangle } from 'lucide-react';
import { extinguisherService, inspectionService, maintenanceService } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { FireExtinguisher, Inspection, MaintenanceLog } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ExtinguisherDetailPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ext, setExt] = useState<FireExtinguisher | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [extRes, insRes, maintRes] = await Promise.allSettled([
          extinguisherService.getById(id),
          inspectionService.getByExtinguisher(id),
          maintenanceService.getByExtinguisher(id),
        ]);
        if (extRes.status === 'fulfilled') setExt(extRes.value.data);
        else navigate('/dashboard/extinguishers');
        if (insRes.status === 'fulfilled') setInspections(insRes.value.data || []);
        if (maintRes.status === 'fulfilled') setMaintenance(maintRes.value.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this extinguisher? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await extinguisherService.delete(id);
      toast.success('Extinguisher deleted');
      navigate('/dashboard/extinguishers');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  if (!ext) return null;

  const isExpiringSoon = () => {
    const days = Math.ceil((new Date(ext.expiryDate).getTime() - Date.now()) / (1000 * 86400));
    return days > 0 && days <= 30;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => navigate('/dashboard/extinguishers')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Extinguishers
        </button>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/dashboard/extinguishers/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Expiry Warning */}
      {isExpiringSoon() && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            This extinguisher expires on {formatDate(ext.expiryDate)} — schedule an inspection soon.
          </p>
        </div>
      )}

      {/* Main Details */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ext.serialNumber}</h2>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">{ext.type.replace(/_/g, ' ')} extinguisher</p>
          </div>
          <StatusBadge status={ext.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoItem label="Manufacturer" value={ext.manufacturer} />
          <InfoItem label="Weight" value={`${ext.weight} kg`} />
          <InfoItem label="Location" value={ext.location} />
          <InfoItem label="Building" value={ext.building || 'N/A'} />
          <InfoItem label="Floor" value={ext.floor || 'N/A'} />
          <InfoItem label="Manufacturing Date" value={formatDate(ext.manufacturingDate)} />
          <InfoItem
            label="Expiry Date"
            value={formatDate(ext.expiryDate)}
            highlight={ext.status === 'expired' ? 'red' : isExpiringSoon() ? 'amber' : undefined}
          />
          <InfoItem
            label="Last Inspection"
            value={ext.lastInspectionDate ? formatDate(ext.lastInspectionDate) : 'Never'}
          />
          <InfoItem
            label="Next Inspection"
            value={ext.nextInspectionDate ? formatDate(ext.nextInspectionDate) : 'Not scheduled'}
          />
        </div>

        {ext.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</p>
            <p className="text-gray-900 dark:text-white text-sm">{ext.notes}</p>
          </div>
        )}
      </div>

      {/* Inspection History */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Inspection History ({inspections.length})
          </h3>
        </div>
        {inspections.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No inspections recorded</p>
        ) : (
          <div className="space-y-3">
            {inspections.slice(0, 5).map((ins) => (
              <div key={ins.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(ins.scheduledDate)}</p>
                  {ins.notes && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{ins.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {ins.result && <StatusBadge status={ins.result} />}
                  <StatusBadge status={ins.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance History */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 text-orange-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Maintenance History ({maintenance.length})
          </h3>
        </div>
        {maintenance.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No maintenance recorded</p>
        ) : (
          <div className="space-y-3">
            {maintenance.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {m.maintenanceType.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{m.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={m.conditionAfter} />
                  <span className="text-xs text-gray-400">{formatDate(m.maintenanceDate)}</span>
                  {m.cost != null && (
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">${Number(m.cost).toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'red' | 'amber';
}) {
  const valueClass =
    highlight === 'red'
      ? 'text-red-600 dark:text-red-400 font-semibold'
      : highlight === 'amber'
      ? 'text-amber-600 dark:text-amber-400 font-semibold'
      : 'text-gray-900 dark:text-white font-medium';

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`mt-0.5 text-sm capitalize ${valueClass}`}>{value}</p>
    </div>
  );
}
