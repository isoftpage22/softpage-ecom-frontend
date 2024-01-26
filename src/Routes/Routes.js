import React, { lazy } from "react";
import { Redirect } from "react-router-dom";
import GuestLayout from "../Layout/Guest";
import LayoutWIthBackButton from "../Layout/LayoutWIthBackButton/LayoutWIthBackButton";
import Dashboard from "../Layout/Dashboard/Dashboard";

const routes = [
  {
    path: "*",
    component: Dashboard,
    routes: [
      {
        path: "/",
        exact: true,
        component: lazy(() => import("../View/Home")),
        isPrivate: false,
        isAuth: true,

      },
      {
        path: "/home/:id",
        component: lazy(() => import("../View/Home")),
        isPrivate: false,
        isAuth: true,

      },
      {
        path: "/cart",
        component: lazy(() => import("../View/ShoppingCart")),
        isPrivate: false,
        isAuth: false,

      },
      {
        path: "/addresses",
        exact: true,
        component: lazy(() => import("../View/Address/AddressListing")),
        isPrivate: false,
        isAuth: false,

      },
      {
        path: "/create-address",
        exact: true,
        component: lazy(() => import("../View/Address/CreateAddress")),
        isPrivate: false,
        isAuth: false,

      },
      {
        path: "/edit-address/:id",
        exact: true,
        component: lazy(() => import("../View/Address/CreateAddress")),
        isPrivate: false,
        isAuth: false,

      },
      {
        path: "/coupons",
        component: LayoutWIthBackButton,
        routes: [
          {
            path: "/coupons",
            exact: true,
            component: lazy(() => import("../View/ListOfCoupons/ListOfCoupons")),
            isPrivate: false,
            isAuth: false,

          },
          {
            component: () => <Redirect to="/" />,
          },
        ],
      },
      {
        path: "/point",
        component: () => <div>Point Component</div>, // Replace with actual component
      },
      {
        path: "*", // Catch-all route
        component: () => <Redirect to="/" />,
      },
    ],
  },
];

export default routes;
