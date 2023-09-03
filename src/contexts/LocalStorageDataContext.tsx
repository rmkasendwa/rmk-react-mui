import { getMemorySize } from '@infinite-debugger/rmk-utils/data';
import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import { FC, ReactNode, createContext, useCallback, useContext } from 'react';

const CACHED_DATA_PREFIX = 'cached-data';
const MAX_DATA_MEMORY_SIZE = 15 * 1024; // 15KB
const MAX_DATA_KEY_COUNT = 35;
const dataKeys: string[] =
  StorageManager.get(`${CACHED_DATA_PREFIX}-keys`) || [];
const baseData: Record<string, any> = StorageManager.get('data') || {};

dataKeys.forEach((key) => {
  const keyData = StorageManager.get(`${CACHED_DATA_PREFIX}-${key}`);
  if (keyData) {
    Object.assign(baseData, {
      [key]: keyData,
    });
  }
});

const updateData = (data: Record<string, any>): Record<string, any> => {
  Object.assign(baseData, data);
  const memorySize = getMemorySize(data);
  if (
    data &&
    typeof memorySize === 'number' &&
    memorySize <= MAX_DATA_MEMORY_SIZE
  ) {
    Object.keys(data).forEach((key) => {
      StorageManager.add(`${CACHED_DATA_PREFIX}-${key}`, data[key]);
      if (dataKeys.includes(key)) {
        dataKeys.splice(dataKeys.indexOf(key), 1);
      }
      dataKeys.push(key);
    });
    if (dataKeys.length > MAX_DATA_KEY_COUNT) {
      const staleDataKeys = dataKeys.splice(
        0,
        dataKeys.length - MAX_DATA_KEY_COUNT
      );
      staleDataKeys.forEach((key) => {
        StorageManager.remove(`${CACHED_DATA_PREFIX}-${key}`);
      });
    }
    StorageManager.add(`${CACHED_DATA_PREFIX}-keys`, dataKeys);
  }
  return baseData;
};

const reset = () => {
  //#region Clear local storage
  dataKeys.forEach((key) => {
    StorageManager.remove(`${CACHED_DATA_PREFIX}-${key}`);
  });
  StorageManager.remove(`${CACHED_DATA_PREFIX}-keys`);
  //#endregion

  //#region Clear memory
  dataKeys.splice(0);
  Object.keys(baseData).forEach((key) => {
    delete baseData[key];
  });
  //#endregion
};

export interface LocalStorageDataContext {
  data: Record<string, any>;
  updateData: (data: Record<string, any>) => void;
  reset: () => void;
}

export const LocalStorageDataContext = createContext<LocalStorageDataContext>({
  data: baseData,
  updateData,
  reset,
});

export interface LocalStorageDataProviderProps {
  children: ReactNode;
}

export const LocalStorageDataProvider: FC<LocalStorageDataProviderProps> = ({
  children,
}) => {
  const updateLocalData = useCallback((data: Record<string, any>) => {
    updateData(data);
  }, []);

  const localReset = useCallback(() => {
    reset();
  }, []);

  return (
    <LocalStorageDataContext.Provider
      value={{
        data: baseData,
        updateData: updateLocalData,
        reset: localReset,
      }}
    >
      {children}
    </LocalStorageDataContext.Provider>
  );
};

export const useLocalStorageData = () => {
  return useContext(LocalStorageDataContext);
};
