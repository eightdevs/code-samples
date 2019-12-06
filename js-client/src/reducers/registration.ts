import { Action } from "redux";
import { ActionType } from "../actions/types";
import { IRegistrationReduxState } from "./interface";

const initialState: IRegistrationReduxState = {
  registering: false,
};

export const registration = (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.USERS_SIGNUP_REQUEST:
      return { ...state, registering: true };
    case ActionType.USERS_SIGNUP_SUCCESS:
      return { ...state, registering: false };
    case ActionType.USERS_SIGNUP_FAILURE:
      return { ...state, registering: false };
    default:
      return state
  }
}