import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface AppThemeConfiguration {
  darkMode: boolean;
}

const themeConfiguration: AppThemeConfiguration = StorageManager.get(
  'theme'
) || {
  darkMode: false,
};

if (
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches &&
  StorageManager.get('theme')?.darkMode == null
) {
  themeConfiguration.darkMode = true;
}

export default function createAppThemeContext(
  initialState: AppThemeConfiguration
) {
  const useStoreData = () => {
    const [themeConfiguration, setThemeConfiguration] = useState(initialState);
    return {
      themeConfiguration,
      setThemeConfiguration,
    };
  };

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType>({} as any);

  const Provider = ({ children }: { children: React.ReactNode }) => {
    return (
      <StoreContext.Provider value={useStoreData()}>
        {children}
      </StoreContext.Provider>
    );
  };

  const useStore = <SelectorOutput,>(
    selector: (store: AppThemeConfiguration) => SelectorOutput
  ): [SelectorOutput, (value: Partial<AppThemeConfiguration>) => void] => {
    const { themeConfiguration, setThemeConfiguration } = useContext(
      StoreContext!
    );

    const setPartialThemeConfiguration = useCallback(
      (value: Partial<AppThemeConfiguration>) => {
        setThemeConfiguration((prevThemeConfiguration) => {
          return { ...prevThemeConfiguration, ...value };
        });
      },
      [setThemeConfiguration]
    );

    return [selector(themeConfiguration), setPartialThemeConfiguration];
  };

  return {
    Provider,
    useStore,
  };
}
const { useStore, Provider } = createAppThemeContext(themeConfiguration);

export const AppThemeProvider = Provider;

export const useAppThemeProperty = (property: keyof AppThemeConfiguration) => {
  const [value, setTheme] = useStore((theme) => theme[property]);

  const setThemeValue = useCallback(
    (value: AppThemeConfiguration[typeof property]) => {
      themeConfiguration[property] = value;
      StorageManager.add('theme', themeConfiguration);
      setTheme({ ...themeConfiguration });
    },
    [property, setTheme]
  );

  return [value, setThemeValue] as [typeof value, typeof setThemeValue];
};
