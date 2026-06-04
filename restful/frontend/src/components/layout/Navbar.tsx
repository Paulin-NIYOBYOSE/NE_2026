import { useState, useEffect, useRef } from 'react';
import { Bell, Moon, Sun, Search, Menu, X, ChevronLeft, FireExtinguisher } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { extinguisherService, notificationService } from '@/api/services';
import type { FireExtinguisher as ExtType } from '@/types';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuToggle: () => void;       // mobile: open drawer
  onDesktopToggle: () => void;    // desktop: collapse sidebar
}

export default function Navbar({ onMenuToggle, onDesktopToggle }: NavbarProps) {
  const { isDark, toggle } = useThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ExtType[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await extinguisherService.getAll({ search, limit: 5 });
        setResults(res.data?.data || []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.data.count);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResultClick = (id: string) => {
    navigate(`/dashboard/extinguishers/${id}`);
    setSearch('');
    setShowResults(false);
    setMobileSearchOpen(false);
  };

  const SearchBox = ({ autoFocus = false }: { autoFocus?: boolean }) => (
    <div ref={searchRef} className="relative">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 w-full">
        {searching
          ? <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          : <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        }
        <input
          autoFocus={autoFocus}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search extinguishers…"
          className="ml-2 bg-transparent outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400 min-w-0"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); setResults([]); setShowResults(false); }}
            className="ml-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden z-50 min-w-[280px]">
          {results.length === 0 && !searching ? (
            <p className="px-4 py-3 text-sm text-gray-400">No results for &quot;{search}&quot;</p>
          ) : (
            <>
              {results.map((ext) => (
                <button
                  key={ext.id}
                  onClick={() => handleResultClick(ext.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md flex-shrink-0">
                    <FireExtinguisher className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ext.serialNumber}</p>
                    <p className="text-xs text-gray-400 truncate">{ext.location} · {ext.type.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                    ext.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    ext.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                  )}>
                    {ext.status}
                  </span>
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2">
                <button
                  onClick={() => {
                    navigate(`/dashboard/extinguishers?search=${encodeURIComponent(search)}`);
                    setShowResults(false);
                    setMobileSearchOpen(false);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all results →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-full px-4 gap-3">

        {/* LEFT: hamburger (mobile) + collapse (desktop) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onDesktopToggle}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* CENTER: search bar (hidden on mobile) */}
        <div className="hidden sm:block flex-1 max-w-sm">
          <SearchBox />
        </div>

        {/* RIGHT: actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark
              ? <Sun className="h-5 w-5 text-yellow-500" />
              : <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            }
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate('/dashboard/notifications')}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight max-w-[120px] truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search drawer */}
      {mobileSearchOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-900">
          <SearchBox autoFocus />
        </div>
      )}
    </header>
  );
}
