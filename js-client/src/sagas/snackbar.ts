import { put, takeEvery, all  } from 'redux-saga/effects';
import { Action } from 'redux';
import uuid from "uuid/v4";
import { ActionType } from '../actions/types';
import { enqueueSnackbar } from '../actions/creators/snackbar';

export function* snackbarSuccess(action: Action & { payload: string }) {
  const { payload: message } = action;
  yield put(enqueueSnackbar(message, "success", uuid()));
}

export function* snackbarError(action: Action & { payload: string }) {
  const { payload: message } = action;
  yield put(enqueueSnackbar(message, "error", uuid()));
}

export function* watchSnackbar() {
  yield takeEvery(ActionType.NOTIFICATION_SUCCESS, snackbarSuccess);
  yield takeEvery(ActionType.NOTIFICATION_ERROR, snackbarError);
}

export default function* snackbarSaga() {
  yield all([
    watchSnackbar()
  ])
}