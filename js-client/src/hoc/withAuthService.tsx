import React from "react";
import { Consumer } from "../services/auth/context";
import AuthService from "../services/auth/service";

export interface IWithAuthServiceProps {
  authService: AuthService;
}

export const withAuthService = <P extends object>(
  Component: React.ComponentType<P>,
): React.FC<Omit<P, keyof IWithAuthServiceProps>> => (props) => (
  <Consumer>
    {(authService) => <Component {...props as P} authService={authService} />}
  </Consumer>
);

export default withAuthService;
