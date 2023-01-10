import {
  GET_PRODUCT_LIST_SUCCESS, GET_PRODUCT_LIST_ERROR,
} from "../actionTypes";
const INITIAL_STATE = {
  productList: [],
};
const products = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_PRODUCT_LIST_SUCCESS:
      return {
        ...state,
        productList: action.payload.data,
      };
    case GET_PRODUCT_LIST_ERROR:
      return {
        ...state,
        productList: [],
      };
      ;

    default:
      return state
  }

}
export default products;