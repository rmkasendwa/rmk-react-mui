import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import { useCallback, useEffect } from 'react';

import { useAppThemeProperty } from '../contexts/AppThemeContext';

/**
 * Hook to toggle dark mode.
 *
 * @returns The dark mode toggle function.
 */
export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useAppThemeProperty('darkMode');

  const toggleDarkMode = useCallback(
    (localDarkMode?: boolean) => {
      if (localDarkMode != null) {
        setDarkMode(localDarkMode);
      } else {
        setDarkMode(!darkMode);
      }
    },
    [darkMode, setDarkMode]
  );

  useEffect(() => {
    const changeEventCallback = (event: MediaQueryListEvent) => {
      if (StorageManager.get('theme')?.darkMode == null) {
        toggleDarkMode(event.matches);
      }
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery?.addEventListener('change', changeEventCallback);
    return () => {
      mediaQuery?.removeEventListener('change', changeEventCallback);
    };
  }, [toggleDarkMode]);

  return { toggleDarkMode };
};
