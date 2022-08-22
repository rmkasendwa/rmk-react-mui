import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { toggleDarkMode as baseToggleDarkMode, setDarkMode } from '../redux';
import StorageManager from '../utils/StorageManager';

export const useDarkMode = () => {
  const dispatch = useDispatch();

  const toggleDarkMode = useCallback(
    (darkMode?: boolean) => {
      if (darkMode != null) {
        dispatch(setDarkMode(darkMode));
      } else {
        dispatch(baseToggleDarkMode());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const changeEventCallback = (event: MediaQueryListEvent) => {
      if (StorageManager.get('theme')?.darkMode == null) {
        toggleDarkMode(event.matches);
      }
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', changeEventCallback);
    return () => {
      mediaQuery.removeEventListener('change', changeEventCallback);
    };
  }, [toggleDarkMode]);

  return { toggleDarkMode };
};
