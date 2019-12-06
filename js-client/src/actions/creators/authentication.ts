import { ActionType } from "../types";

export const signInRequest = (login: string, password: string) => {
  return {
    type: ActionType.USERS_SIGNIN_REQUEST,
    payload: { login, password },
  }
};

export const signInSuccess = (payload: string) => {
  return {
    type: ActionType.USERS_SIGNIN_SUCCESS,
    payload,
  }
};

export const signInFailure = (payload: string) => {
  return {
    type: ActionType.USERS_SIGNIN_FAILURE,
    payload,
  }
};

