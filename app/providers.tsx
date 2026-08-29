"use client";

import { Provider } from "react-redux";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import store from "@/src/Store";
import theme from "@/src/ChakraUI/theme";
import Loader from "@/src/Components/Loader/Loader";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <CacheProvider>
        <ChakraProvider theme={theme}>
          <Loader />
          {children}
        </ChakraProvider>
      </CacheProvider>
    </Provider>
  );
}
