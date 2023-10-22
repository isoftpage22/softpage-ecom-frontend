import _ from "lodash";
import {
  ADD_PRODUCT_TO_CART,
  DELETE_PRODUCT_TO_CART,
  ADD_VARIANT,
  DELETE_VARIANT,
  EMPTY_VARIANT,
  EMPTY_CART_PRODUCT,
  UPDATE_PRODUCT_TO_CART,
  SET_COUPONS,
  GENERATE_OTP,
  VALIDATE_OTP,
  GET_UPCOMING_EVENTS,
  EMPTY_CART_PRODUCT_SUCCESS
} from "../actionTypes";


const INITIAL_STATE = {
  // allProductsArray: [],
  addToCart: {
    products: [],
  },
  // addToVariantsCart: {
  //   products: [],
  // },
  // checkPreviousProduct: null,
  setCoupon:0,
  // generateOtpNumber:null,
  // validateOtpNumber:null,
  // upcomingEventsList:[]
};
const shoppingCart = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_PRODUCT_TO_CART:
        let productInfo = action.payload
        let _addToCart = _.cloneDeep(state.addToCart);
        let stateProducts = _addToCart.products;
        let productIndex = stateProducts.findIndex(
          (_product) => _product.product_id === productInfo.id
        );
        if (productIndex !== -1) {
          stateProducts[productIndex].quantity =
            stateProducts[productIndex].quantity + 1;
          stateProducts[productIndex].total_amount = Math.round(
            parseFloat(stateProducts[productIndex].total_amount) +
            parseFloat(productInfo.discountedPrice!==null && productInfo.discountedPrice!=="0.00" && productInfo.discountedPrice!=="0.0" && productInfo.discountedPrice!=="0"?productInfo.discountedPrice:productInfo.productCost)
          );
        } 
        else {
          let tempProduct = {
            product_id: productInfo.id,
            quantity: 1,
            unit_price: parseFloat(productInfo.discountedPrice!==null && productInfo.discountedPrice!=="0.00" && productInfo.discountedPrice!=="0.0" && productInfo.discountedPrice!=="0"?productInfo.discountedPrice:productInfo.price).toFixed(2),

            total_amount: Math.round( parseFloat(productInfo.discountedPrice!==null && productInfo.discountedPrice!=="0.00" && productInfo.discountedPrice!=="0.0" && productInfo.discountedPrice!=="0"?productInfo.
            discountedPrice:productInfo.price)),

            discountPercent: productInfo.productDiscount,
            discountedPrice:productInfo.discountedPrice,
            product:productInfo,
            productName:productInfo.productName,

          };
          stateProducts.push(tempProduct);
        }
        return {
          ...state,
          addToCart: _addToCart,
        };
        case DELETE_PRODUCT_TO_CART: {
          let productId = action.payload.id;
          let _addToCart = _.cloneDeep(state.addToCart);
          let stateProducts = _addToCart.products;
    
          let productIndex = stateProducts.findIndex(
            (_product) => _product.product_id === productId
          );
          if (productIndex !== -1) {
            if (stateProducts[productIndex].quantity === 1) {
              stateProducts.splice(productIndex, 1);
            } else {
              stateProducts[productIndex].quantity =
                stateProducts[productIndex].quantity - 1;
              stateProducts[productIndex].total_amount = (
                parseFloat(stateProducts[productIndex].total_amount) -
                parseFloat(stateProducts[productIndex].unit_price)
              ).toFixed(2);
            }
          }
          return {
            ...state,
            addToCart: _addToCart,
          };
        }
      case EMPTY_CART_PRODUCT_SUCCESS :{
        return {
          ...state,
          addToCart: INITIAL_STATE.addToCart,
        };
      }
        default:
          return state
      
     }
     

}

export default shoppingCart;
