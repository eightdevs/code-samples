import { combineReducers } from 'redux';
import { authentication } from './authentication';
import { registration } from './registration';
import { snackbar } from './snackbar';

const rootReducer = combineReducers({
  authentication,
  registration,
  snackbar,
});

export default rootReducer;
