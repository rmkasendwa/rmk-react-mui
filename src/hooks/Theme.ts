import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  RootState,
  setThemeProperty as baseSetThemeProperty,
  toggleDarkMode as baseToggleDarkMode,
  setDarkMode,
} from '../redux';

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
    mediaQuery?.addEventListener('change', changeEventCallback);
    return () => {
      mediaQuery?.removeEventListener('change', changeEventCallback);
    };
  }, [toggleDarkMode]);

  return { toggleDarkMode };
};

export const useCachedThemeProperty = <T = any>(
  property: string,
  defaultValue?: T
) => {
  const dispatch = useDispatch();
  const value: T = useSelector((state: RootState) => {
    const { theme } = state;
    return (theme as any)[property] || defaultValue;
  });

  const setThemeProperty = useCallback(
    (payload?: T) => {
      dispatch(baseSetThemeProperty(property, payload));
    },
    [dispatch, property]
  );

  useEffect(() => {
    if (defaultValue != null && value == null) {
      setThemeProperty(defaultValue);
    }
  }, [defaultValue, setThemeProperty, value]);

  return { setThemeProperty, [property]: value } as {
    setThemeProperty: (payload: T) => void;
  } & { [property: string]: T };
};
