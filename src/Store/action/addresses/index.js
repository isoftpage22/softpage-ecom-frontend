import {
  
  SELECTED_ADDRESS
} from "../../actionTypes";
import * as constdata from "../../../utils/constants";
import * as consturl from "../../../utils/url";
import { getToken } from "../../../utils/token";

export const saveUsersAddress = (_payload, resolve, reject) => {
  return { type: SELECTED_ADDRESS, payload: _payload };

}