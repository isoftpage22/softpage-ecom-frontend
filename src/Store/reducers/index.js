import {combineReducers} from 'redux';
import products from "./products";
import shoppingCart from "./shoppingCart";
import modalsNDrawers from "./modalsNDrawers";
import address from "./address";



const rootReducer = combineReducers({
  products, 
  shoppingCart,
  modalsNDrawers,
  address
});

export default rootReducer;