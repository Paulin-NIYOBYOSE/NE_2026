import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import ProtectedRoute from '@/routes/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'));
const ExtinguishersPage = lazy(() => import('@/pages/dashboard/ExtinguishersPage'));
const AddExtinguisherPage = lazy(() => import('@/pages/dashboard/AddExtinguisherPage'));
const ExtinguisherDetailPage = lazy(() => import('@/pages/dashboard/ExtinguisherDetailPage'));
const EditExtinguisherPage = lazy(() => import('@/pages/dashboard/EditExtinguisherPage'));
const InspectionsPage = lazy(() => import('@/pages/dashboard/InspectionsPage'));
const AddInspectionPage = lazy(() => import('@/pages/dashboard/AddInspectionPage'));
const MaintenancePage = lazy(() => import('@/pages/dashboard/MaintenancePage'));
const AddMaintenancePage = lazy(() => import('@/pages/dashboard/AddMaintenancePage'));
const UsersPage = lazy(() => import('@/pages/dashboard/UsersPage'));
const ReportsPage = lazy(() => import('@/pages/dashboard/ReportsPage'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'));
const AuditLogsPage = lazy(() => import('@/pages/dashboard/AuditLogsPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));

function PageLoader() {
  return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
}

export default function App() {
  const { initialize: initAuth } = useAuthStore();
  const { initialize: initTheme } = useThemeStore();

  useEffect(() => {
    initAuth();
    initTheme();
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="extinguishers" element={<ExtinguishersPage />} />
          <Route path="extinguishers/add" element={<ProtectedRoute roles={['admin']}><AddExtinguisherPage /></ProtectedRoute>} />
          <Route path="extinguishers/:id" element={<ExtinguisherDetailPage />} />
          <Route path="extinguishers/:id/edit" element={<ProtectedRoute roles={['admin']}><EditExtinguisherPage /></ProtectedRoute>} />
          <Route path="inspections" element={<InspectionsPage />} />
          <Route path="inspections/add" element={<ProtectedRoute roles={['admin', 'inspector']}><AddInspectionPage /></ProtectedRoute>} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="maintenance/add" element={<ProtectedRoute roles={['admin', 'inspector', 'technician']}><AddMaintenancePage /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={['admin', 'inspector']}><ReportsPage /></ProtectedRoute>} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogsPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
