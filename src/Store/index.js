"use client";

import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import products from "./reducers/products";
import shoppingCart from "./reducers/shoppingCart";
import modalsNDrawers from "./reducers/modalsNDrawers";
import address from "./reducers/address";
import loader from "./reducers/loader";
import orders from "./reducers/orders";
import rootSaga from "./saga/index";
import { productsApi } from "@/store/api/productsApi";
import { qrApi } from "@/store/api/qrApi";
import { storefrontAuthApi } from "@/store/api/storefrontAuthApi";
import { cartApi } from "@/store/api/cartApi";
import { ordersApi } from "@/store/api/ordersApi";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  products,
  shoppingCart,
  modalsNDrawers,
  address,
  loader,
  orders,
  [productsApi.reducerPath]: productsApi.reducer,
  [qrApi.reducerPath]: qrApi.reducer,
  [storefrontAuthApi.reducerPath]: storefrontAuthApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
      immutableCheck: false,
    }).concat(
      sagaMiddleware,
      productsApi.middleware,
      qrApi.middleware,
      storefrontAuthApi.middleware,
      cartApi.middleware,
      ordersApi.middleware,
    ),
  devTools: typeof window !== "undefined",
});

sagaMiddleware.run(rootSaga);

export default store;
