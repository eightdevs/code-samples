import { put, takeEvery, all, call } from 'redux-saga/effects';
import { ActionType } from '../actions/types';
import AuthService from '../services/auth/service';
import { signInSuccess, signInFailure } from '../actions/creators/authentication';
import { AxiosResponse } from 'axios';
import { IAuthResponse, IErrorResponse } from '../services/auth/interface';
import { Action } from 'redux';
import { successNotification, errorNotification } from '../actions/creators/notification';

const service = new AuthService();

export function* signIn(action: Action & { payload: { login: string, password: string } }) {
  const { login, password } = action.payload;
  try {
    const response: AxiosResponse<IAuthResponse> = yield call([service, service.signIn], login, password);
    const { data: { token } } = response.data;
    yield call([localStorage, "setItem"], "token", token);
    yield put(signInSuccess(token));
    yield put(successNotification("USERS_SIGNIN_SUCCESS"));
  } catch (err) {
    const { error } = err.response.data as { error: IErrorResponse };
    console.log(error);
    yield put(signInFailure(error.message));
    yield put(errorNotification(error.message));
  }
}

export function* watchSignIn() {
  yield takeEvery(ActionType.USERS_SIGNIN_REQUEST, signIn);
}

export default function* authenticationSaga() {
  yield all([
    watchSignIn()
  ])
}