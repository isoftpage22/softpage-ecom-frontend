import React from 'react';  
import { Redirect, Route } from 'react-router-dom';
// import {getToken} from '../utils/token';
const LoginRoute = ({ component: Component,trackPage, fbPixelPageView,...rest }) => {
  const userToken = 2;
  return (
      <Route {...rest} render={props => {
        return (
          (!userToken ?
              <Component {...props} />
              :
              <Redirect to={{ pathname: '/', state: { from: props.location } }} />
          )
        )
      }
    }/>
  );
};

export default LoginRoute; 