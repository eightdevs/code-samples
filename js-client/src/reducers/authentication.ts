import { Action } from "redux";
import { ActionType } from "../actions/types";
import { IAuthenticationReduxState } from "./interface";
// import { IUsersReduxStore } from "./interface";

// let user = JSON.parse(localStorage.getItem('user'));
// const initialState = user ? { loggedIn: true, user } : {};

const initialState: IAuthenticationReduxState = {
  loggedIn: false,
  loggingIn: false,
  token: undefined,
};

export const authentication = (state = initialState, action: Action & { payload: any }) => {
  switch (action.type) {
    case ActionType.USERS_SIGNIN_REQUEST:
      return { ...state, loggingIn: true, loggedIn: false, token: undefined };
    case ActionType.USERS_SIGNIN_SUCCESS: {
      const { payload } = action as { payload: string };
      return { ...state, loggingIn: false, loggedIn: true, token: payload };
    }
    case ActionType.USERS_SIGNIN_FAILURE:
      return { ...state, loggingIn: false, loggedIn: false, token: undefined };
    case ActionType.USERS_SIGNOUT:
      return { ...state, loggingIn: false, loggedIn: false, token: undefined };
    default:
      return state
  }
}