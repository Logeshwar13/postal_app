import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export const useTheme = () => {
  const { isDarkMode, toggleTheme, setTheme } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleTheme,
    setTheme,
  };
};
