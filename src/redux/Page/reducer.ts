import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import { Reducer } from 'redux';

import { PageHistory } from '../../interfaces/Page';
import { CLEAR_PAGE_HISTORY, SET_PAGE_TITLE } from './types';

const page: {
  title?: string;
  history: PageHistory;
} = {
  history: StorageManager.get('page-history') || [],
};

export const pageReducer: Reducer = (state = page, { type, payload }) => {
  switch (type) {
    case SET_PAGE_TITLE:
      const history: PageHistory = StorageManager.get('page-history') || [];
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
