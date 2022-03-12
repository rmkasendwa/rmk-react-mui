import { Reducer } from 'redux';

import StorageManager from '../../utils/StorageManager';
import { TOGGLE_DARK_MODE } from './types';

const theme = StorageManager.get('theme') || { darkMode: false };

export const themeReducer: Reducer = (state = theme, action) => {
  let newState = { ...state };
  switch (action.type) {
    case TOGGLE_DARK_MODE:
      newState = { ...state, darkMode: !state.darkMode };
  }
  StorageManager.add('theme', newState);
  return newState;
};
