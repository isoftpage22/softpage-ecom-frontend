import {
  ADD_PRODUCT_TO_CART,
  DELETE_PRODUCT_TO_CART,
  EMPTY_CART_PRODUCT,
  EMPTY_CART_PRODUCT_SUCCESS
  
} from "../../actionTypes";
import * as constdata from "../../../utils/constants";
import * as consturl from "../../../utils/url";
import { getToken } from "../../../utils/token";

export const addToCartProduct = (_payload) => {
    return { type: ADD_PRODUCT_TO_CART, payload: _payload };
  
};
export const deleteToCartProduct = (_payload) => {
  return { type: DELETE_PRODUCT_TO_CART, payload: _payload };
};
export const emptyCartProduct = (_payload) => {
  return { type: EMPTY_CART_PRODUCT_SUCCESS, payload: _payload };
};