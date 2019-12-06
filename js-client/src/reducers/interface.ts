import { VariantType } from "notistack";

export interface IAuthenticationReduxState {
  loggedIn: boolean,
  loggingIn: boolean,
  token?: string,
}

export interface IRegistrationReduxState {
  registering: boolean,
}

export interface ISnackbarReduxState {
  [key: string]: {
    message: string,
    variant: VariantType,
  }
}

export interface IRootReduxState {
  authentication: IAuthenticationReduxState,
  registration: IRegistrationReduxState,
  snackbar: ISnackbarReduxState,
}
