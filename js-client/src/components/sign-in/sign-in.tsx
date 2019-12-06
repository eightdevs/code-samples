import React from "react";
import { connect } from "react-redux";
import { IRootReduxState } from '../../reducers/interface';
import { Redirect, withRouter } from 'react-router-dom'

// Containers
import SignInContainer from "../../containers/sign-in/sign-in";
// import withAuthService, { IWithAuthServiceProps } from "../../hoc/withAuthService";
import { RouteComponentProps } from "react-router";
// import { ActionType } from "../../actions/types";
import { signInRequest } from "../../actions/creators/authentication";
import { Dispatch } from "redux";

interface ISignInProps {
  loggingIn: boolean;
  loggedIn: boolean;
  signInRequest: (login: string, password: string) => any,
}

export class SignIn extends React.Component<ISignInProps & RouteComponentProps> {

  state = {
    login: "",
    password: "",
  };

  onFieldChange = (name: string, value: string) => {
    this.setState({ [name]: value });
  }
  onSubmit = async () => {
    const { signInRequest } = this.props;
    const { login, password } = this.state;
    signInRequest(login, password);
    // await this.props.authService.signIn(login, password);
  }

  componentDidUpdate() {
    if (this.props.loggedIn === true) {
      this.props.history.push("/");
      console.log("SHOULD BE REDIRECT");
    }
  }

  render() {
    const { loggingIn, loggedIn } = this.props;
    console.log("SIGN IN RENDER", loggingIn, loggedIn);
    if (loggedIn) {
      return <Redirect to={{ pathname: "/" }} />;
    }
    return <SignInContainer loggingIn={loggingIn} onSubmit={this.onSubmit} onFieldChange={this.onFieldChange} />;
  }
}

const mapStateToProps = (state: IRootReduxState) => ({ 
  loggingIn: state.authentication.loggingIn,
  loggedIn: state.authentication.loggedIn,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signInRequest: (login: string, password: string) => dispatch(signInRequest(login, password)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SignIn));
