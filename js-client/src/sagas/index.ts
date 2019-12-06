import { all } from 'redux-saga/effects';

import watchAuthentication from "./authentication";
import watchSnackbar from "./snackbar";

export default function* rootSaga() {
  yield all([
    watchAuthentication(),
    watchSnackbar(),
  ])
}