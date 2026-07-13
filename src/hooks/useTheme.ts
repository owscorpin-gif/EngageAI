import { useEffect, useState } from 'react';
import { validateInput, ThemeSchema } from '../utils/validation';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Validate the stored theme value against the ThemeSchema enum
    // to prevent arbitrary strings from being injected via localStorage.
    const stored = localStorage.getItem('engage_ai_theme');
    const validation = validateInput(ThemeSchema, stored);
    if (validation.success) {
      return validation.data;
    }
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPreference ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('engage_ai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
