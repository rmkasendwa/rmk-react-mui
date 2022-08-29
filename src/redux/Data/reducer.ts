import { Reducer } from 'redux';

import { getMemorySize } from '../../utils/data';
import StorageManager from '../../utils/StorageManager';
import { UPDATE_DATA } from './types';

const MAX_DATA_MEMORY_SIZE = 15 * 1024; // 15KB
const MAX_DATA_KEY_COUNT = 35;
const allDataKeys: string[] = StorageManager.get('api-data-keys') || [];
const dataKeys = allDataKeys.splice(-MAX_DATA_KEY_COUNT);
const data: Record<string, any> = StorageManager.get('data') || {};

if (allDataKeys.length > 0) {
  allDataKeys.forEach((key) => {
    StorageManager.remove(`api-data-${key}`);
  });
  StorageManager.add(`api-data-keys`, dataKeys);
}

dataKeys.forEach((key) => {
  const keyData = StorageManager.get(`api-data-${key}`);
  if (keyData) {
    Object.assign(data, {
      [key]: keyData,
    });
  }
});

export const dataReducer: Reducer = (state = data, { type, payload }) => {
  let newState = { ...state };
  switch (type) {
    case UPDATE_DATA:
      newState = { ...state, ...payload };
      break;
  }
  if ([UPDATE_DATA].includes(type)) {
    if (payload && getMemorySize(payload) <= MAX_DATA_MEMORY_SIZE) {
      Object.keys(payload).forEach((key) => {
        StorageManager.add(`api-data-${key}`, payload[key]);
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
  }
  return newState;
};
