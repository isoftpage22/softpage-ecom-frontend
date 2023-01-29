/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { lazy } from "react";
import { Redirect } from "react-router-dom";

// import AuthLayout from "../layouts/Auth";
// import ErrorLayout from './layouts/Error';
import GuestLayout from "../Layout/Guest";
import UserProfileLayout from "../Layout/UserProfile";

// const a=0

const routes = [
 
  {
    route: "*",
    component: GuestLayout,
    routes: [
      {
        path: "/",
        exact: true,
        component: lazy(() => import("../View/Home")),
        isPrivate: false,
      },
     
      {
        route: "/user-profile",
        component: UserProfileLayout,
        routes: [
          {
            path: "/user-profile/my-profile",
            exact: true,
            component: lazy(() => import("../View/Home")),        
            isPrivate: true,
          },
          {
            component: () => <Redirect to="/" />,
          },
        ],
      },
      {
        component: () => <Redirect to="/" />,
      },
    ],
  },

];

export default routes;
