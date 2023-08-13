/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { lazy } from "react";
import { Redirect } from "react-router-dom";

// import AuthLayout from "../layouts/Auth";
// import ErrorLayout from './layouts/Error';
import GuestLayout from "../Layout/Guest";
import LayoutWIthBackButton from "../Layout/LayoutWIthBackButton";

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
        path: "/cart",
        exact: true,
        component: lazy(() => import("../View/ShoppingCart")),
        isPrivate: false,
      },
       {
        route: "/user-profile",
        component: LayoutWIthBackButton,
        routes: [
          {
            path: "/user-profile",
            exact: true,
            component: lazy(() => import("../View/ListOfCoupons/ListOfCoupons")),        
            isPrivate: false,
          },
          {
            component: () => <Redirect to="/" />,
          },
        ],
      },
     
      // {
      //   route: "/user-profile",
      //   component: LayoutWIthBackButton,
      //   routes: [
      //     {
      //       path: "/user-profile",
      //       exact: true,
      //       component: lazy(() => import("../View/ListOfCoupons/ListOfCoupons")),        
      //       isPrivate: false,
      //     },
      //     {
      //       component: () => <Redirect to="/" />,
      //     },
      //   ],
      // },
      {
        component: () => <Redirect to="/" />,
      },
    ],
  },

];

export default routes;
