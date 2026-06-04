import { useEffect, useState } from 'react';
import { Bell, Mail, AlertTriangle, Info, Check, CheckCheck } from 'lucide-react';
import { notificationService } from '@/api/services';
import type { Notification, PaginatedResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const typeIcons: Record<string, any> = {
  email: Mail,
  system: Info,
  alert: AlertTriangle,
};

export default function NotificationsPage() {
  const [data, setData] = useState<PaginatedResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { fetchData(); }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll(page, 10);
      setData(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleMarkAsRead = async (id: string) => {
    setMarkingId(id);
    try {
      await notificationService.markAsRead(id);
      toast.success('Marked as read');
      fetchData();
    } catch {} finally { setMarkingId(null); }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchData();
    } catch {} finally { setMarkingAll(false); }
  };

  const unreadCount = data?.data?.filter(n => !n.isRead).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Your personal notifications and alerts"
        action={
          unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              {markingAll ? 'Marking...' : 'Mark All Read'}
            </button>
          )
        }
      />

      {unreadCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {loading ? <LoadingSpinner size="lg" className="min-h-[40vh]" /> : !data?.data?.length ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up! No notifications at this time." />
      ) : (
        <div className="space-y-3">
          {data.data.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div key={n.id} className={`bg-white dark:bg-gray-900 rounded-xl border p-4 hover:shadow-md transition-shadow ${n.isRead ? 'border-gray-200 dark:border-gray-800 opacity-75' : 'border-blue-200 dark:border-blue-800'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${n.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30' : n.type === 'email' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Icon className={`h-5 w-5 ${n.type === 'alert' ? 'text-red-600' : n.type === 'email' ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!n.isRead && <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />}
                        <h4 className={`text-sm truncate ${n.isRead ? 'text-gray-500 dark:text-gray-400 font-normal' : 'text-gray-900 dark:text-white font-medium'}`}>{n.subject}</h4>
                      </div>
                      <StatusBadge status={n.status} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{n.body}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</span>
                        {n.eventType && <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{n.eventType}</span>}
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          disabled={markingId === n.id}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" />
                          {markingId === n.id ? '...' : 'Mark read'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {data.meta.page} of {data.meta.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(page + 1)} disabled={page >= data.meta.totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
