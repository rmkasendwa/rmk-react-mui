import { CLEAR_PAGE_HISTORY, SET_PAGE_TITLE } from './types';

export const setPageTitle = (title?: string) => {
  return {
    type: SET_PAGE_TITLE,
    payload: title,
  };
};

export const clearPageHistory = () => {
  return {
    type: CLEAR_PAGE_HISTORY,
  };
};
