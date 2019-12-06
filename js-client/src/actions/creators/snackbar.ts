import { ActionType } from "../types";
import { VariantType } from 'notistack';

export const enqueueSnackbar = (message: string, variant: VariantType, key: string ) => ({
  type: ActionType.SNACKBAR_ENQUEUE,
  payload: { message, variant, key }
});
export const closeSnackbar = (payload: string) => ({ type: ActionType.SNACKBAR_CLOSE, payload });
export const dismissSnackbar = (payload: string) => ({ type: ActionType.SNACKBAR_DISMISS, payload });
export const dismissaAllSnackbar = () => ({ type: ActionType.SNACKBAR_DISMISS_ALL });
