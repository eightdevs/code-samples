export interface IAuthSignIn {
  login: string;
  password: string;
}

export interface IAuthSignUp {
  login: string;
  password: string;
}

export interface IToken {
  token: string;
}

export interface IJWT {
  jwt: {
    userId: string;
    iat: number;
    exp: number;
  };
}
