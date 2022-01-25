import { Reducer } from 'redux';

import StorageManager from '../../utils/StorageManager';
import { UPDATE_DATA } from './types';

const dataKeys: string[] = StorageManager.get('api-data-keys') || [];
const data: Record<string, any> = StorageManager.get('data') || {};

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
  }
  if ([UPDATE_DATA].includes(type)) {
    if (payload) {
      Object.keys(payload).forEach((key) => {
        StorageManager.add(`api-data-${key}`, payload[key]);
        dataKeys.includes(key) || dataKeys.push(key);
      });
      StorageManager.add(`api-data-keys`, dataKeys);
    }
  }
  return newState;
};
