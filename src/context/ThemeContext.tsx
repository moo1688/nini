import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type ThemeMode = Theme | 'auto';
interface ThemeContextValue { theme: Theme; themeMode: ThemeMode; setThemeMode: (mode: ThemeMode) => void; }
const Context = createContext<ThemeContextValue>({ theme: 'dark', themeMode: 'auto', setThemeMode: () => undefined });
const systemTheme = (): Theme => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setMode] = useState<ThemeMode>(() => {
    try { const saved = localStorage.getItem('localagent-theme-mode'); if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved; } catch { /* storage disabled */ }
    return 'auto';
  });
  const [theme, setTheme] = useState<Theme>(() => themeMode === 'auto' ? systemTheme() : themeMode);
  const setThemeMode = useCallback((mode: ThemeMode) => { setMode(mode); try { localStorage.setItem('localagent-theme-mode', mode); } catch { /* storage disabled */ } }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setTheme(themeMode === 'auto' ? (media.matches ? 'dark' : 'light') : themeMode);
    update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update);
  }, [themeMode]);
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  const value = useMemo(() => ({ theme, themeMode, setThemeMode }), [theme, themeMode, setThemeMode]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useTheme = () => useContext(Context);
