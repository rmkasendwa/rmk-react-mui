import { Reducer } from 'redux';

import StorageManager from '../../utils/StorageManager';
import { UPDATE_DATA } from './types';

const allDataKeys: string[] = StorageManager.get('api-data-keys') || [];
const dataKeys = allDataKeys.splice(-10);
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
    if (payload) {
      Object.keys(payload).forEach((key) => {
        StorageManager.add(`api-data-${key}`, payload[key]);
        dataKeys.includes(key) || dataKeys.push(key);
      });
      if (dataKeys.length > 0) {
        const staleDataKeys = dataKeys.splice(0, dataKeys.length - 10);
        staleDataKeys.forEach((key) => {
          StorageManager.remove(`api-data-${key}`);
        });
      }
      StorageManager.add(`api-data-keys`, dataKeys);
    }
  }
  return newState;
};
