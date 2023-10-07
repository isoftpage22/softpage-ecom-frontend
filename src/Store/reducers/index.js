import {combineReducers} from 'redux';
import products from "./products";
import shoppingCart from "./shoppingCart";
import modalsNDrawers from "./modalsNDrawers";
import address from "./address";
import loader from "./loader";




const rootReducer = combineReducers({
  products, 
  shoppingCart,
  modalsNDrawers,
  address,
  loader
});

export default rootReducer;