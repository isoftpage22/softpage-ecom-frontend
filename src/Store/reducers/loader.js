import {
    LOADER_STATUS,
    ROUTE_LOADER_STATUS,
} from "../actionTypes";

const INITIAL_STATE = {
  isloading: false,
  routeLoading: false,
  message: "Loading... Please wait",
};

const loader = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOADER_STATUS: {
      const payload = action.payload;
      if (typeof payload === "boolean") {
        return {
          ...state,
          isloading: payload,
          message: payload ? state.message : INITIAL_STATE.message,
        };
      }
      return {
        ...state,
        isloading: Boolean(payload?.isloading),
        message: payload?.message || INITIAL_STATE.message,
      };
    }
    case ROUTE_LOADER_STATUS:
      return {
        ...state,
        routeLoading: Boolean(action.payload),
      };
    default:
      return state;
  }
};

export default loader;
