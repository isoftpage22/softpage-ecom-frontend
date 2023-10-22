import _ from "lodash";
import {
  EMPTY_ORDER_PAYMENT_STATUSES, VERIFY_ORDER_PAYMENT_SUCCESS, VERIFY_ORDER_PAYMENT_ERROR, EMPTY_ORDER_PAYMENT_STATUSES_SUCCESS
} from "../actionTypes";


const INITIAL_STATE = {
  orderCompleteStatus: {
     fromView:null,
     paymentStatus:false
  },
};
const orders = (state = INITIAL_STATE, action) => {
  switch (action.type) {

    case VERIFY_ORDER_PAYMENT_SUCCESS:{
      let _orderCompleteStatus = _.cloneDeep(state.orderCompleteStatus);
      _orderCompleteStatus.paymentStatus = true
      _orderCompleteStatus.fromView = 'OrderStatus'

      return {
        ...state,
        orderCompleteStatus: _orderCompleteStatus,
      }};
    case VERIFY_ORDER_PAYMENT_ERROR:{
      let _orderCompleteStatus = _.cloneDeep(state.orderCompleteStatus);
      _orderCompleteStatus.paymentStatus = false
      _orderCompleteStatus.fromView = 'OrderStatus'

      return {
        ...state,
        paymentStatus: _orderCompleteStatus,
      }};
     case EMPTY_ORDER_PAYMENT_STATUSES_SUCCESS:{
      return {
        ...state,
        orderCompleteStatus:INITIAL_STATE.orderCompleteStatus
      }
     }
    default:
      return state

  }


}

export default orders;
