import {combineReducers} from 'redux';
import products from "./products";
import shoppingCart from "./shoppingCart";
import modalsNDrawers from "./modalsNDrawers";
import address from "./address";
import loader from "./loader";
import orders from "./orders";





const rootReducer = combineReducers({
  products, 
  shoppingCart,
  modalsNDrawers,
  address,
  loader,
  orders
});

export default rootReducer;