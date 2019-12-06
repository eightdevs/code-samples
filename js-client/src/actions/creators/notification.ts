import { ActionType } from "../types";

export const successNotification = (payload: string) => ({ type: ActionType.NOTIFICATION_SUCCESS, payload });
export const errorNotification = (payload: string) => ({ type: ActionType.NOTIFICATION_ERROR, payload });

