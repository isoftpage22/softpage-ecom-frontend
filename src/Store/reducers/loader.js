import _ from "lodash";
import {
    LOADER_STATUS
} from "../actionTypes";


const INITIAL_STATE = {
  isloading: false,
  message: "Loading... Please wait",
};

const loader = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOADER_STATUS: {
      const payload = action.payload;
      if (typeof payload === "boolean") {
        return {
          isloading: payload,
          message: payload ? state.message : INITIAL_STATE.message,
        };
      }
      return {
        isloading: Boolean(payload?.isloading),
        message: payload?.message || INITIAL_STATE.message,
      };
    }
    default:
      return state;
  }
};

export default loader;
