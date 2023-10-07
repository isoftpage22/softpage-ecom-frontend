import {
  
    LOADER_STATUS
  } from "../../actionTypes";
  import * as constdata from "../../../utils/constants";
  import * as consturl from "../../../utils/url";
  import { getToken } from "../../../utils/token";
  
  export const setLoader = (_payload, resolve, reject) => {
    return { type: LOADER_STATUS, payload: _payload };
  
  }