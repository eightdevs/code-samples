import React from 'react';
import { Route, Redirect, withRouter } from 'react-router-dom';

export const GuestRoute = ({ component, isAuthenticated, ...rest }: any) => {
  const routeComponent = (props: any) => (
    !isAuthenticated
      ? React.createElement(component, props)
      : <Redirect to={{pathname: '/'}}/>
  );
  return <Route {...rest} render={routeComponent}/>;
};

export default withRouter(GuestRoute)