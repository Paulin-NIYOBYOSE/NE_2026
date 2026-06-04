import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { inspectionService, extinguisherService, userService } from '@/api/services';
import PageHeader from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';
import type { FireExtinguisher, User } from '@/types';

const schema = z.object({
  extinguisherId: z.string().min(1, 'Please select an extinguisher'),
  inspectorId: z.string().min(1, 'Please select an inspector'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddInspectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [extRes, inspRes] = await Promise.all([
          extinguisherService.getSelectOptions(),
          userService.getInspectors(),
        ]);
        setExtinguishers(extRes.data || []);
        setInspectors(inspRes.data || []);
      } catch {
        toast.error('Failed to load options');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await inspectionService.create({
        ...data,
        scheduledDate: new Date(data.scheduledDate).toISOString(),
      });
      toast.success('Inspection scheduled successfully!');
      navigate('/dashboard/inspections');
    } catch {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all';

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Schedule Inspection" description="Schedule a new fire extinguisher inspection" />

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {loadingOptions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-500">Loading options...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
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
              {extinguishers.length === 0 && (
                <p className="text-amber-500 text-xs mt-1">
                  No active extinguishers found. Add extinguishers first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Inspector *
              </label>
              <select {...register('inspectorId')} className={inputClass}>
                <option value="">Select inspector...</option>
                {inspectors.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.firstName} {ins.lastName} — {ins.email}
                  </option>
                ))}
              </select>
              {errors.inspectorId && (
                <p className="text-red-500 text-xs mt-1">{errors.inspectorId.message}</p>
              )}
              {inspectors.length === 0 && (
                <p className="text-amber-500 text-xs mt-1">
                  No inspectors found. An admin must create inspector accounts.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Date & Time *
              </label>
              <input
                {...register('scheduledDate')}
                type="datetime-local"
                className={inputClass}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.scheduledDate && (
                <p className="text-red-500 text-xs mt-1">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                {...register('notes')}
                className={inputClass}
                rows={3}
                placeholder="Optional inspection notes or instructions..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || extinguishers.length === 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Scheduling...' : 'Schedule Inspection'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/inspections')}
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
