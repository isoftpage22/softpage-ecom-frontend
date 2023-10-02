import React, { lazy } from "react";
import { Redirect } from "react-router-dom";
import GuestLayout from "../Layout/Guest";
import LayoutWIthBackButton from "../Layout/LayoutWIthBackButton/LayoutWIthBackButton";
import Dashboard from "../Layout/Dashboard/Dashboard";

const routes = [
  {
    path: "/",
    component: Dashboard,
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
        path: "/addresses",
        exact: true,
        component: lazy(() => import("../View/Address/AddressListing")),
        isPrivate: false,
      },
      {
        path: "/create-address",
        exact: true,
        component: lazy(() => import("../View/Address/CreateAddress")),
        isPrivate: false,
      },
      {
        path: "/edit-address/:id",
        exact: true,
        component: lazy(() => import("../View/Address/CreateAddress")),
        isPrivate: false,
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
