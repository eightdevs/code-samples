import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import CssBaseline from "@material-ui/core/CssBaseline";
import './app.css';

// Components
import Home from '../home/home';
import SignIn from '../sign-in/sign-in';
import SignUp from '../sign-up/sign-up';
import PrivateRoute from '../private-route/private-route';
import GuestRoute from '../guest-route/guest-route';
import withAuthService, { IWithAuthServiceProps } from '../../hoc/withAuthService';
import Notifier from '../notifier/notifier';

const history = createBrowserHistory();

const App: React.FC<IWithAuthServiceProps> = (props: IWithAuthServiceProps) => {
  const isAuthenticated = props.authService.isAuthenticated();
  console.log("App RENDER", isAuthenticated);
  return (
    <React.Fragment>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        // preventDuplicate={true}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
      >
        <Notifier />
        <Router history={history}>
          <PrivateRoute exact path="/" component={Home} />
          <GuestRoute path="/signin" component={SignIn} />
          <GuestRoute path="/signup" component={SignUp} />
        </Router>
      </SnackbarProvider>
    </React.Fragment>
  );
}

export default withAuthService(App);
