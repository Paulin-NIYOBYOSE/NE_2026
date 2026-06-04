import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { extinguisherService } from '@/api/services';
import PageHeader from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';

const schema = z.object({
  serialNumber: z.string().min(1, 'Serial number is required'),
  type: z.enum(['water', 'foam', 'co2', 'dry_powder', 'wet_chemical'] as const),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  manufacturingDate: z.string().min(1, 'Manufacturing date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  location: z.string().min(1, 'Location is required'),
  building: z.string().optional(),
  floor: z.string().optional(),
  weight: z.preprocess((v) => parseFloat(String(v)), z.number().positive('Weight must be positive')),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema> & { weight: number };

export default function AddExtinguisherPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await extinguisherService.create(data);
      toast.success('Extinguisher added successfully!');
      navigate('/dashboard/extinguishers');
    } catch {
      // handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Add Extinguisher" description="Register a new fire extinguisher in the system" />

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number *</label>
              <input {...register('serialNumber')} className={inputClass} placeholder="FE-2024-001" />
              {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select {...register('type')} className={inputClass}>
                <option value="water">Water</option>
                <option value="foam">Foam</option>
                <option value="co2">CO2</option>
                <option value="dry_powder">Dry Powder</option>
                <option value="wet_chemical">Wet Chemical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer *</label>
              <input {...register('manufacturer')} className={inputClass} placeholder="FireGuard Inc." />
              {errors.manufacturer && <p className="text-red-500 text-xs mt-1">{errors.manufacturer.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg) *</label>
              <input {...register('weight')} type="number" step="0.1" className={inputClass} placeholder="4.5" />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturing Date *</label>
              <input {...register('manufacturingDate')} type="date" className={inputClass} />
              {errors.manufacturingDate && <p className="text-red-500 text-xs mt-1">{errors.manufacturingDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date *</label>
              <input {...register('expiryDate')} type="date" className={inputClass} />
              {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
              <input {...register('location')} className={inputClass} placeholder="Building A, Floor 2, Room 201" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
              <input {...register('building')} className={inputClass} placeholder="Building A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
              <input {...register('floor')} className={inputClass} placeholder="2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea {...register('notes')} className={inputClass} rows={3} placeholder="Optional notes..." />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating...' : 'Add Extinguisher'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/extinguishers')}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
