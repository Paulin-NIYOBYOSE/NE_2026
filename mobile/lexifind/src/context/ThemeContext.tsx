import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
}

const THEME_KEY = '@lexifind:theme';
const SOUND_KEY = '@lexifind:sound';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useColorScheme();
  const systemScheme = rnUseColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [soundEnabled, setSoundState] = useState(true);

  const isDark =
    theme === 'system' ? systemScheme === 'dark' : theme === 'dark';

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(SOUND_KEY),
    ]).then(([savedTheme, savedSound]) => {
      if (
        savedTheme === 'light' ||
        savedTheme === 'dark' ||
        savedTheme === 'system'
      ) {
        setThemeState(savedTheme);
        setColorScheme(savedTheme);
      }
      if (savedSound !== null) {
        setSoundState(savedSound === 'true');
      }
    });
  }, [setColorScheme]);

  const setTheme = useCallback(
    async (mode: ThemeMode) => {
      setThemeState(mode);
      setColorScheme(mode);
      await AsyncStorage.setItem(THEME_KEY, mode);
    },
    [setColorScheme],
  );

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    setSoundState(enabled);
    await AsyncStorage.setItem(SOUND_KEY, String(enabled));
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, isDark, setTheme, soundEnabled, setSoundEnabled }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
