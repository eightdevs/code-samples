import axios, { AxiosResponse } from "axios";
import { IAuthContext } from "./context";
// import { signInRequest, signInSuccess, signInFailure } from "../../actions/creators";
// import store from "../../store";
import { IAuthResponse } from "./interface";

export default class AuthService implements IAuthContext {
  private readonly routeSignIn = "http://localhost:4000/signin";
  // private readonly routeSignUp = "http://localhost:4000/signup";

  public isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  public async test(): Promise<any> {}

  public async signIn(login: string, password: string): Promise<AxiosResponse<IAuthResponse>> {
    return axios.post(this.routeSignIn, { login, password })
  }
}
