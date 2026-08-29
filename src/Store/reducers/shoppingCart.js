import _ from "lodash";
import {
  ADD_PRODUCT_TO_CART,
  DELETE_PRODUCT_TO_CART,
  EMPTY_CART_PRODUCT_SUCCESS,
  SET_CART_TIP,
  SET_CART_NOTES,
  SET_CART_CHECKOUT_ERROR,
  HYDRATE_CART,
  SET_ACTIVE_ORDER,
} from "../actionTypes";
import { cartLineKey, catalogUnitPrice } from "../../../lib/catalog/options";
import { lineMatchesItemNames } from "../../../lib/api/userFacingError";
import { loadMenuCart } from "@/lib/cart/persistCart";

const EMPTY_CART = {
  addToCart: {
    products: [],
  },
  setCoupon: 0,
  tip: 0,
  specialInstructions: "",
  checkoutError: null,
  activeOrder: null,
};

function stateFromStorage() {
  const stored = loadMenuCart();
  if (!stored) return EMPTY_CART;
  return {
    ...EMPTY_CART,
    addToCart: { products: stored.products || [] },
    tip: stored.tip || 0,
    specialInstructions: stored.specialInstructions || "",
    activeOrder: stored.activeOrder || null,
  };
}

const INITIAL_STATE = stateFromStorage();

function roundMoney(value) {
  return Math.round(parseFloat(value) || 0);
}

const shoppingCart = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case HYDRATE_CART: {
      const payload = action.payload || {};
      return {
        ...state,
        addToCart: { products: Array.isArray(payload.products) ? payload.products : [] },
        tip: Number(payload.tip) || 0,
        specialInstructions: payload.specialInstructions || "",
        checkoutError: null,
        activeOrder: payload.activeOrder || null,
      };
    }
    case SET_ACTIVE_ORDER:
      return {
        ...state,
        activeOrder: action.payload || null,
      };
    case ADD_PRODUCT_TO_CART: {
      const productInfo = action.payload || {};
      const _addToCart = _.cloneDeep(state.addToCart);
      const stateProducts = _addToCart.products;
      const productId = productInfo.id;
      const addQuantity = Number(productInfo.addQuantity) > 0 ? Number(productInfo.addQuantity) : 1;
      const variantId = productInfo.variantId ?? null;
      const addons = productInfo.addons || [];
      const comboSelections = productInfo.comboSelections || [];
      const incomingKey =
        productInfo.lineKey ||
        cartLineKey({
          product_id: productId,
          variantId,
          addons,
          comboSelections,
        });
      const unit = Number(
        productInfo.unitPrice != null ? productInfo.unitPrice : catalogUnitPrice(productInfo)
      );
      const productIndex = stateProducts.findIndex((line) => line.lineKey === incomingKey);

      const nextLine = {
        product_id: productId,
        lineKey: incomingKey,
        quantity: addQuantity,
        unit_price: Number(unit).toFixed(2),
        total_amount: roundMoney(unit * addQuantity),
        discountPercent: productInfo.productDiscount,
        discountedPrice: productInfo.discountedPrice,
        product: productInfo,
        productName: productInfo.productName,
        variantId,
        variantName: productInfo.variantName || "",
        addons,
        comboSelections,
        customizationLabel: productInfo.customizationLabel || "",
      };
      const replaceIndex = productInfo.replaceLineKey
        ? stateProducts.findIndex((line) => line.lineKey === productInfo.replaceLineKey)
        : -1;

      if (replaceIndex !== -1) {
        const mergeIndex = stateProducts.findIndex(
          (line, index) => index !== replaceIndex && line.lineKey === incomingKey,
        );
        if (mergeIndex !== -1) {
          stateProducts[mergeIndex].quantity =
            Number(stateProducts[mergeIndex].quantity) + addQuantity;
          stateProducts[mergeIndex].total_amount = roundMoney(
            Number(stateProducts[mergeIndex].unit_price) * stateProducts[mergeIndex].quantity,
          );
          stateProducts.splice(replaceIndex, 1);
        } else {
          stateProducts[replaceIndex] = nextLine;
        }
      } else if (productIndex !== -1) {
        const line = stateProducts[productIndex];
        line.quantity = Number(line.quantity) + addQuantity;
        line.total_amount = roundMoney(Number(line.unit_price) * line.quantity);
      } else {
        stateProducts.push(nextLine);
      }
      return {
        ...state,
        addToCart: _addToCart,
        activeOrder: null,
      };
    }
    case DELETE_PRODUCT_TO_CART: {
      const payload = action.payload || {};
      const productId = payload.id || payload.product_id;
      const _addToCart = _.cloneDeep(state.addToCart);
      const stateProducts = _addToCart.products;
      let productIndex = -1;
      if (payload.lineKey) {
        productIndex = stateProducts.findIndex((line) => line.lineKey === payload.lineKey);
      } else {
        for (let i = stateProducts.length - 1; i >= 0; i -= 1) {
          if (String(stateProducts[i].product_id) === String(productId)) {
            productIndex = i;
            break;
          }
        }
      }
      if (productIndex !== -1) {
        if (stateProducts[productIndex].quantity === 1) {
          stateProducts.splice(productIndex, 1);
        } else {
          stateProducts[productIndex].quantity = stateProducts[productIndex].quantity - 1;
          stateProducts[productIndex].total_amount = roundMoney(
            Number(stateProducts[productIndex].unit_price) * stateProducts[productIndex].quantity
          );
        }
      }
      const blockedNames = state.checkoutError?.itemNames || [];
      const stillBlocked = blockedNames.length
        ? stateProducts.some((line) => lineMatchesItemNames(line, blockedNames))
        : false;
      return {
        ...state,
        addToCart: _addToCart,
        checkoutError: stillBlocked ? state.checkoutError : null,
      };
    }
    case EMPTY_CART_PRODUCT_SUCCESS: {
      return {
        ...state,
        addToCart: { products: [] },
        tip: 0,
        specialInstructions: "",
        checkoutError: null,
      };
    }
    case SET_CART_TIP:
      return {
        ...state,
        tip: Number(action.payload) || 0,
      };
    case SET_CART_NOTES:
      return {
        ...state,
        specialInstructions: action.payload || "",
      };
    case SET_CART_CHECKOUT_ERROR:
      return {
        ...state,
        checkoutError: action.payload || null,
      };
    default:
      return state;
  }
};

export default shoppingCart;
