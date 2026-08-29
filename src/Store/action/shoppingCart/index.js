import {
  ADD_PRODUCT_TO_CART,
  DELETE_PRODUCT_TO_CART,
  EMPTY_CART_PRODUCT_SUCCESS,
  SET_CART_TIP,
  SET_CART_NOTES,
  SET_CART_CHECKOUT_ERROR,
  HYDRATE_CART,
  SET_ACTIVE_ORDER,
} from "../../actionTypes";

export const addToCartProduct = (_payload) => {
  return { type: ADD_PRODUCT_TO_CART, payload: _payload };
};
export const deleteToCartProduct = (_payload) => {
  return { type: DELETE_PRODUCT_TO_CART, payload: _payload };
};
export const emptyCartProduct = (_payload) => {
  return { type: EMPTY_CART_PRODUCT_SUCCESS, payload: _payload };
};
export const setCartTip = (_payload) => {
  return { type: SET_CART_TIP, payload: _payload };
};
export const setCartNotes = (_payload) => {
  return { type: SET_CART_NOTES, payload: _payload };
};
export const setCartCheckoutError = (_payload) => {
  return { type: SET_CART_CHECKOUT_ERROR, payload: _payload || null };
};
export const hydrateCart = (_payload) => {
  return { type: HYDRATE_CART, payload: _payload || null };
};
export const setActiveOrder = (_payload) => {
  return { type: SET_ACTIVE_ORDER, payload: _payload || null };
};
