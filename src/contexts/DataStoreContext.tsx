import { createContext, useContext } from 'react';

import { getMemorySize } from '../utils/data';
import StorageManager from '../utils/StorageManager';

const MAX_DATA_MEMORY_SIZE = 15 * 1024; // 15KB
const MAX_DATA_KEY_COUNT = 35;
const allDataKeys: string[] = StorageManager.get('api-data-keys') || [];
const dataKeys = allDataKeys.splice(-MAX_DATA_KEY_COUNT);
const baseData: Record<string, any> = StorageManager.get('data') || {};

if (allDataKeys.length > 0) {
  allDataKeys.forEach((key) => {
    StorageManager.remove(`api-data-${key}`);
  });
  StorageManager.add(`api-data-keys`, dataKeys);
}

dataKeys.forEach((key) => {
  const keyData = StorageManager.get(`api-data-${key}`);
  if (keyData) {
    Object.assign(baseData, {
      [key]: keyData,
    });
  }
});

export interface IDataStoreContext {
  data: Record<string, any>;
  updateData: (data: Record<string, any>) => void;
}
export const DataStoreContext = createContext<IDataStoreContext>({
  data: baseData,
  updateData: (data) => {
    Object.assign(baseData, data);
    if (data && getMemorySize(data) <= MAX_DATA_MEMORY_SIZE) {
      Object.keys(data).forEach((key) => {
        StorageManager.add(`api-data-${key}`, data[key]);
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
          StorageManager.remove(`api-data-${key}`);
        });
      }
      StorageManager.add(`api-data-keys`, dataKeys);
    }
  },
});

export const useCachedData = () => {
  return useContext(DataStoreContext);
};
