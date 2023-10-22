import _ from "lodash";
import {
    LOADER_STATUS
} from "../actionTypes";


const INITIAL_STATE = {
  isloading: false,  
};
const loader = (state = INITIAL_STATE, action) => {
  switch (action.type) {

    case LOADER_STATUS:
      let addressPayload = action.payload
      return {
        isloading: addressPayload,
      };
        default:
          return state
      
     }
     

}

export default loader;
