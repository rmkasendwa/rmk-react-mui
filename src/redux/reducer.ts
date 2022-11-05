import { combineReducers } from 'redux';

import { pageReducer } from './Page/reducer';

const rootReducer = combineReducers({
  page: pageReducer,
});

export default rootReducer;
