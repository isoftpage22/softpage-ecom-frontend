import {combineReducers} from 'redux';
import products from "./products";
import shoppingCart from "./shoppingCart";

const rootReducer = combineReducers({
  products, 
  shoppingCart
  
});

export default rootReducer;