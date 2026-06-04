import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { maintenanceService, extinguisherService } from '@/api/services';
import PageHeader from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';
import type { FireExtinguisher } from '@/types';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  extinguisherId: z.string().min(1, 'Please select an extinguisher'),
  technicianId: z.string().min(1, 'Technician ID is required'),
  maintenanceType: z.enum(['refill', 'repair', 'replacement', 'pressure_test', 'general_service'] as const),
  conditionBefore: z.enum(['good', 'fair', 'poor', 'critical'] as const),
  conditionAfter: z.enum(['good', 'fair', 'poor', 'critical'] as const),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  partsReplaced: z.string().optional(),
  cost: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : parseFloat(String(v))),
    z.number().min(0).optional(),
  ),
  maintenanceDate: z.string().min(1, 'Maintenance date is required'),
  nextMaintenanceDate: z.string().optional(),
});

type FormData = z.infer<typeof schema> & { cost?: number };

export default function AddMaintenancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      maintenanceType: 'general_service',
      conditionBefore: 'fair',
      conditionAfter: 'good',
      technicianId: user?.id || '',
      maintenanceDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    extinguisherService.getSelectOptions()
      .then((res) => setExtinguishers(res.data || []))
      .catch(() => toast.error('Failed to load extinguishers'))
      .finally(() => setLoadingOptions(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await maintenanceService.create(data);
      toast.success('Maintenance logged successfully!');
      navigate('/dashboard/maintenance');
    } catch {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all';

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Log Maintenance" description="Record a maintenance action for a fire extinguisher" />

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {loadingOptions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-500">Loading options...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fire Extinguisher *
                </label>
                <select {...register('extinguisherId')} className={inputClass}>
                  <option value="">Select extinguisher...</option>
                  {extinguishers.map((ext) => (
                    <option key={ext.id} value={ext.id}>
                      {ext.serialNumber} — {ext.location} ({ext.type.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
                {errors.extinguisherId && (
                  <p className="text-red-500 text-xs mt-1">{errors.extinguisherId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Technician ID *
                </label>
                <input
                  {...register('technicianId')}
                  className={inputClass}
                  placeholder="Your user ID (auto-filled)"
                />
                {errors.technicianId && (
                  <p className="text-red-500 text-xs mt-1">{errors.technicianId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maintenance Type *
                </label>
                <select {...register('maintenanceType')} className={inputClass}>
                  <option value="general_service">General Service</option>
                  <option value="refill">Refill</option>
                  <option value="repair">Repair</option>
                  <option value="replacement">Replacement</option>
                  <option value="pressure_test">Pressure Test</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condition Before *
                </label>
                <select {...register('conditionBefore')} className={inputClass}>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condition After *
                </label>
                <select {...register('conditionAfter')} className={inputClass}>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cost ($)
                </label>
                <input
                  {...register('cost')}
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  placeholder="75.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maintenance Date *
                </label>
                <input {...register('maintenanceDate')} type="date" className={inputClass} />
                {errors.maintenanceDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.maintenanceDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Maintenance Date
                </label>
                <input {...register('nextMaintenanceDate')} type="date" className={inputClass} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  className={inputClass}
                  rows={3}
                  placeholder="Describe what maintenance was performed..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parts Replaced
                </label>
                <input
                  {...register('partsReplaced')}
                  className={inputClass}
                  placeholder="e.g., Pressure gauge, hose nozzle"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Logging...' : 'Log Maintenance'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/maintenance')}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
