"use client";

import React from "react";
import { useSelector } from "react-redux";
import { Text } from "@chakra-ui/react";
import "./loader-styles.css";

const Loader = ({ isloading: isloadingProp, message: messageProp }) => {
  const isloadingState = useSelector((state) => state.loader?.isloading);
  const messageState = useSelector((state) => state.loader?.message);
  const isloading = isloadingProp ?? isloadingState;
  const message = messageProp ?? messageState;
  if (!isloading) return null;
  return (
    <div className="loader" style={{ display: "block" }} data-testid="app-loader">
      <div className="loader-container">
        <div className="spinner mb-2" />
        <Text as="span" color="white" px="24px" textAlign="center">
          {message || "Loading... Please wait"}
        </Text>
      </div>
    </div>
  );
};

export default Loader;
