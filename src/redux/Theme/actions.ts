import { SET_DARK_MODE, TOGGLE_DARK_MODE } from './types';

export const toggleDarkMode = () => {
  return {
    type: TOGGLE_DARK_MODE,
  };
};

export const setDarkMode = (darkMode: boolean) => {
  return {
    type: SET_DARK_MODE,
    payload: darkMode,
  };
};

export const setThemeProperty = (property: string, payload: any) => {
  return {
    type: property,
    payload,
  };
};
