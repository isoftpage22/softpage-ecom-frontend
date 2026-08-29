import {
  LOADER_STATUS
} from "../../actionTypes";

export const setLoader = (_payload) => {
  if (typeof _payload === "object" && _payload !== null) {
    return { type: LOADER_STATUS, payload: _payload };
  }
  return { type: LOADER_STATUS, payload: Boolean(_payload) };
};
