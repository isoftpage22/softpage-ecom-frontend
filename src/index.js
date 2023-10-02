import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from "@chakra-ui/react"
import { Provider as StoreProvider } from 'react-redux';
import extendTheme from "./ChakraUI/theme";
import "@fontsource/raleway/400.css"
import "@fontsource/open-sans/700.css"
import Store from "./Store/index";
// import 'ui-neumorphism/dist/index.css'
const theme = extendTheme
ReactDOM.render(
  <React.StrictMode>
      <StoreProvider store={Store}>
    <ChakraProvider theme={theme}>
    <App />
    </ChakraProvider>
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
