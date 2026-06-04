import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FireExtinguisher, ClipboardCheck,
  Wrench, BarChart3, Bell, UserCircle, LogOut, ChevronLeft,
  Shield, X, ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const navigation = [
  { name: 'Dashboard',     href: '/dashboard',              icon: LayoutDashboard,  end: true, roles: ['admin', 'inspector', 'technician', 'user'] },
  { name: 'Users',         href: '/dashboard/users',         icon: Users,            roles: ['admin'] },
  { name: 'Extinguishers', href: '/dashboard/extinguishers', icon: FireExtinguisher, roles: ['admin', 'inspector', 'technician', 'user'] },
  { name: 'Inspections',   href: '/dashboard/inspections',   icon: ClipboardCheck,   roles: ['admin', 'inspector', 'technician', 'user'] },
  { name: 'Maintenance',   href: '/dashboard/maintenance',   icon: Wrench,           roles: ['admin', 'inspector', 'technician', 'user'] },
  { name: 'Reports',       href: '/dashboard/reports',       icon: BarChart3,        roles: ['admin', 'inspector'] },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell,             roles: ['admin', 'inspector', 'technician', 'user'] },
  { name: 'Audit Logs',    href: '/dashboard/audit-logs',    icon: ClipboardList,    roles: ['admin'] },
  { name: 'Profile',       href: '/dashboard/profile',       icon: UserCircle,       roles: ['admin', 'inspector', 'technician', 'user'] },
];

export default function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.role || ''),
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-gray-900 dark:text-white truncate">
              TZW LTD
            </span>
          )}
        </div>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {sidebarContent}

        {/* Collapse toggle button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm hover:shadow-md transition-all z-50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 text-gray-500 transition-transform duration-300',
              collapsed && 'rotate-180',
            )}
          />
        </button>
      </aside>

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 z-40 h-screen w-64 flex flex-col',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
