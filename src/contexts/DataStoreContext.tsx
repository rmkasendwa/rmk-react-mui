import { getMemorySize } from '@infinite-debugger/rmk-utils/data';
import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

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
  // Clear local storage
  dataKeys.forEach((key) => {
    StorageManager.remove(`${CACHED_DATA_PREFIX}-${key}`);
  });
  StorageManager.remove(`${CACHED_DATA_PREFIX}-keys`);

  // Clear memory
  dataKeys.splice(0);
  Object.keys(baseData).forEach((key) => {
    delete baseData[key];
  });
};

export interface DataStoreContext {
  data: Record<string, any>;
  updateData: (data: Record<string, any>) => void;
  reset: () => void;
}
export const DataStoreContext = createContext<DataStoreContext>({
  data: baseData,
  updateData,
  reset,
});

export interface DataStoreProviderProps {
  children: ReactNode;
}

export const DataStoreProvider: FC<DataStoreProviderProps> = ({ children }) => {
  const [data, setData] = useState(baseData);

  const updateLocalData = useCallback((data: Record<string, any>) => {
    setData({ ...updateData(data) });
  }, []);

  const localReset = useCallback(() => {
    reset();
    setData({ ...baseData });
  }, []);

  return (
    <DataStoreContext.Provider
      value={{
        data,
        updateData: updateLocalData,
        reset: localReset,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  );
};

export const useCachedData = () => {
  return useContext(DataStoreContext);
};
