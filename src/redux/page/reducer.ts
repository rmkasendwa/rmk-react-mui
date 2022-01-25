import { Reducer } from 'redux';

import { SET_PAGE_TITLE } from './types';

const page: {
  title?: string;
} = {};

export const pageReducer: Reducer = (state = page, { type, payload }) => {
  switch (type) {
    case SET_PAGE_TITLE:
      return { ...state, title: payload };
    default:
      return { ...state };
  }
};
