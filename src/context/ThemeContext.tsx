import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type ThemeMode = 'dark' | 'light' | 'auto';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeMode: 'dark',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

function getSystemTimeTheme(): Theme {
  const hour = new Date().getHours();
  // 6:00 - 18:00 light, 18:00 - 6:00 dark
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'auto') return getSystemTimeTheme();
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('localagent-theme-mode');
      if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved;
    } catch {}
    return 'dark';
  });

  const [theme, setTheme] = useState<Theme>(() => resolveTheme(themeMode));

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try { localStorage.setItem('localagent-theme-mode', mode); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  }, [theme, setThemeMode]);

  // Resolve theme when mode changes
  useEffect(() => {
    setTheme(resolveTheme(themeMode));
  }, [themeMode]);

  // Auto mode: re-check every minute
  useEffect(() => {
    if (themeMode !== 'auto') return;
    const interval = setInterval(() => {
      setTheme(getSystemTimeTheme());
    }, 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
