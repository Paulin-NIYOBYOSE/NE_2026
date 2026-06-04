import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { extinguisherService } from '@/api/services';
import type { FireExtinguisher } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = z.object({
  serialNumber: z.string().min(1),
  type: z.enum(['water', 'foam', 'co2', 'dry_powder', 'wet_chemical'] as const),
  manufacturer: z.string().min(1),
  manufacturingDate: z.string().min(1),
  expiryDate: z.string().min(1),
  location: z.string().min(1),
  building: z.string().optional(),
  floor: z.string().optional(),
  weight: z.preprocess((v) => parseFloat(String(v)), z.number().positive()),
  status: z.enum(['active', 'expired', 'maintenance', 'decommissioned'] as const),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema> & { weight: number };

export default function EditExtinguisherPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    if (id) {
      extinguisherService.getById(id)
        .then((res) => {
          const d = res.data;
          reset({
            serialNumber: d.serialNumber,
            type: d.type,
            manufacturer: d.manufacturer,
            manufacturingDate: d.manufacturingDate?.split('T')[0],
            expiryDate: d.expiryDate?.split('T')[0],
            location: d.location,
            building: d.building || '',
            floor: d.floor || '',
            weight: Number(d.weight),
            status: d.status,
            notes: d.notes || '',
          });
        })
        .catch(() => navigate('/dashboard/extinguishers'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await extinguisherService.update(id, data);
      toast.success('Extinguisher updated!');
      navigate(`/dashboard/extinguishers/${id}`);
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Edit Extinguisher" description="Update extinguisher information" />
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
              <input {...register('serialNumber')} className={inputClass} />
              {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select {...register('type')} className={inputClass}>
                <option value="water">Water</option>
                <option value="foam">Foam</option>
                <option value="co2">CO2</option>
                <option value="dry_powder">Dry Powder</option>
                <option value="wet_chemical">Wet Chemical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select {...register('status')} className={inputClass}>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="maintenance">Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
              <input {...register('weight')} type="number" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
              <input {...register('manufacturer')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input {...register('location')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturing Date</label>
              <input {...register('manufacturingDate')} type="date" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
              <input {...register('expiryDate')} type="date" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
              <input {...register('building')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
              <input {...register('floor')} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea {...register('notes')} className={inputClass} rows={3} />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
