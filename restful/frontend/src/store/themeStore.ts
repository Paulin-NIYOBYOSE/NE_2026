import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,

  initialize: () => {
    const saved = localStorage.getItem('theme');
    // DEFAULT = light mode. Only go dark if user explicitly chose dark.
    const isDark = saved === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      // Ensure light is persisted on first visit
      if (!saved) localStorage.setItem('theme', 'light');
    }
    set({ isDark });
  },

  toggle: () => {
    set((state) => {
      const newDark = !state.isDark;
      if (newDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return { isDark: newDark };
    });
  },
}));
