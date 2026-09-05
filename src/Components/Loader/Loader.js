"use client";

import React from "react";
import { useSelector } from "react-redux";
import { LoaderOverlay } from "./LoaderOverlay";

const Loader = ({ isloading: isloadingProp, message: messageProp }) => {
  const isloadingState = useSelector((state) => state.loader?.isloading);
  const routeLoading = useSelector((state) => state.loader?.routeLoading);
  const messageState = useSelector((state) => state.loader?.message);
  const apiLoading = isloadingProp ?? isloadingState;
  const visible = Boolean(apiLoading || routeLoading);
  const message = messageProp ?? (apiLoading ? messageState : "Loading... Please wait");
  if (!visible) return null;
  return <LoaderOverlay message={message} />;
};

export default Loader;
