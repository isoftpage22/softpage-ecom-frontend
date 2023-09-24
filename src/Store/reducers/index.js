import {combineReducers} from 'redux';
import products from "./products";
import shoppingCart from "./shoppingCart";
import modalsNDrawers from "./modalsNDrawers";


const rootReducer = combineReducers({
  products, 
  shoppingCart,
  modalsNDrawers
});

export default rootReducer;