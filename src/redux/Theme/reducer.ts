import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import { Reducer } from 'redux';

import { SET_DARK_MODE, TOGGLE_DARK_MODE } from './types';

const theme = StorageManager.get('theme') || { darkMode: false };

if (
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches &&
  StorageManager.get('theme')?.darkMode == null
) {
  theme.darkMode = true;
}

export const themeReducer: Reducer = (state = theme, { type, payload }) => {
  let newState = { ...state };
  switch (type) {
    case TOGGLE_DARK_MODE:
      newState = { ...state, darkMode: !state.darkMode };
      break;
    case SET_DARK_MODE:
      newState = { ...state, darkMode: payload };
      break;
    default:
      newState = { ...state, [type]: payload };
  }
  StorageManager.add('theme', newState);
  return newState;
};
