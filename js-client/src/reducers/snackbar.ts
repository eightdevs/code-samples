import { Action } from "redux";
import { ActionType } from "../actions/types";
import { ISnackbarReduxState } from "./interface";
import { VariantType } from 'notistack';

const initialState: ISnackbarReduxState = {};

export const snackbar = (state = initialState, action: Action & {
  payload: { message: string, variant: VariantType, key: string } | string
}) => {
  switch (action.type) {
    case ActionType.SNACKBAR_ENQUEUE: {
      const { payload: { message, variant, key } } = action as { payload: { message: string, variant: VariantType, key: string } };
      console.log("REDUCE.SNACKBAR_ENQUEUE", message, variant, key);
      return { ...state, [key]: { message, variant } };
    }
    case ActionType.SNACKBAR_DISMISS:
    case ActionType.SNACKBAR_CLOSE: {
      const { payload: key } = action as { payload: string };
      const newState = { ...state };
      delete newState[key];
      return newState;
    }
    case ActionType.SNACKBAR_DISMISS_ALL: {
      return {};
    }
    default:
      return state
  }
}