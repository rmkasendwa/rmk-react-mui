import { UPDATE_DATA } from './types';

export const updateData = (payload?: Record<string, any>) => {
  return {
    type: UPDATE_DATA,
    payload,
  };
};
