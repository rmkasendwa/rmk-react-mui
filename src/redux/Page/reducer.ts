import { Reducer } from 'redux';

import { TPageHistory } from '../../interfaces';
import StorageManager from '../../utils/StorageManager';
import { CLEAR_PAGE_HISTORY, SET_PAGE_TITLE } from './types';

const page: {
  title?: string;
  history: TPageHistory;
} = {
  history: StorageManager.get('page-history') || [],
};

export const pageReducer: Reducer = (state = page, { type, payload }) => {
  switch (type) {
    case SET_PAGE_TITLE:
      const history: TPageHistory = StorageManager.get('page-history') || [];
      history.unshift({
        title: payload,
        pathName: window.location.pathname,
        search: window.location.search,
      });
      history.splice(500);
      StorageManager.add('page-history', history);
      return { ...state, title: payload, history };
    case CLEAR_PAGE_HISTORY:
      StorageManager.remove('page-history');
      return { ...state, history: [] };
    default:
      return { ...state };
  }
};
