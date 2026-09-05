"use client";

import { Suspense } from "react";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";
import store from "@/src/Store";
import theme from "@/src/ChakraUI/theme";
import Loader from "@/src/Components/Loader/Loader";
import { NavigationLoader } from "@/components/NavigationLoader";
import { EmotionRegistry } from "./emotion-registry";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <EmotionRegistry>
        <ChakraProvider theme={theme}>
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          <Loader />
          {children}
        </ChakraProvider>
      </EmotionRegistry>
    </Provider>
  );
}
