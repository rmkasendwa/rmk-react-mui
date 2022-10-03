import { combineReducers } from 'redux';

import { pageReducer } from './Page/reducer';
import { themeReducer } from './Theme/reducer';

const rootReducer = combineReducers({
  theme: themeReducer,
  page: pageReducer,
});

export default rootReducer;
