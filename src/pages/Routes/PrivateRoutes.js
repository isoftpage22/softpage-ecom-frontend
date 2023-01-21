import React from 'react';  
import { useRouter } from 'next/router'
import {getToken} from '../utils/token';
const useRouter = ({ component: Component, trackPage, fbPixelPageView,...rest }) => {
  const userToken = getToken()
  return (
      <Route {...rest} render={props => {
        return (
          (userToken ?
              <Component {...props} />
              :
              <Redirect href={{ pathname: '/', state: { from: props.location } }} />
          )
        )
      }
    }/>
  );
};

export default useRouter; 