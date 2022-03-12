import { combineReducers } from 'redux';

import { dataReducer } from './Data/reducer';
import { pageReducer } from './Page/reducer';
import { themeReducer } from './Theme/reducer';

const rootReducer = combineReducers({
  theme: themeReducer,
  page: pageReducer,
  data: dataReducer,
});

export default rootReducer;
