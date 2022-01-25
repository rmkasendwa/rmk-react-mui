import { combineReducers } from 'redux';

import { dataReducer } from './data/reducer';
import { pageReducer } from './page/reducer';
import { themeReducer } from './theme/reducer';

const rootReducer = combineReducers({
  theme: themeReducer,
  page: pageReducer,
  data: dataReducer,
});

export default rootReducer;
