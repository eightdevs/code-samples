export enum ActionType {
  // notifications
  NOTIFICATION_SUCCESS = "NOTIFICATION_SUCCESS",
  NOTIFICATION_ERROR = "NOTIFICATION_ERROR",

  // snackbar
  SNACKBAR_ENQUEUE = "SNACKBAR_ENQUEUE",
  SNACKBAR_CLOSE = "SNACKBAR_CLOSE",
  SNACKBAR_DISMISS = "SNACKBAR_DISMISS",
  SNACKBAR_DISMISS_ALL = "SNACKBAR_DISMISS_ALL",

  // users
  USERS_SIGNUP_REQUEST = "USERS_SIGNUP_REQUEST",
  USERS_SIGNUP_SUCCESS = "USERS_SIGNUP_SUCCESS",
  USERS_SIGNUP_FAILURE = "USERS_SIGNUP_FAILURE",

  USERS_SIGNIN_REQUEST = "USERS_SIGNIN_REQUEST",
  USERS_SIGNIN_SUCCESS = "USERS_SIGNIN_SUCCESS",
  USERS_SIGNIN_FAILURE = "USERS_SIGNIN_FAILURE",
  
  USERS_SIGNOUT = "USERS_SIGNOUT",

  // saga
  USERS_SIGNIN = "USERS_SIGNIN",
}