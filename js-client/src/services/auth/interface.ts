export interface ITokenResponse {
  token: string;
}

export interface IErrorResponse {
  type: string;
  message: string;
}

export interface IAuthResponse {
  error: IErrorResponse;
  token: string;
  data: ITokenResponse;
}