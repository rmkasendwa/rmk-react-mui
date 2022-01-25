import { SET_PAGE_TITLE } from './types';

export const setPageTitle = (title?: string) => {
  return {
    type: SET_PAGE_TITLE,
    payload: title,
  };
};
