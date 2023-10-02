import _ from "lodash";
import {
  SELECTED_ADDRESS
} from "../actionTypes";


const INITIAL_STATE = {
  address: {},  
};
const usersAddress = (state = INITIAL_STATE, action) => {
  switch (action.type) {

    case SELECTED_ADDRESS:
      let addressPayload = action.payload
      return {
        address: addressPayload,
      };
        default:
          return state
      
     }
     

}

export default usersAddress;
