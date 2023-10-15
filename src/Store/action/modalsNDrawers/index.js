import {
  API_INVOCATION,
  TOGGLE_USER_FORM_DRAWER
} from "../../actionTypes";
import * as constdata from "../../../utils/constants";
import * as consturl from "../../../utils/url";
import { getToken } from "../../../utils/token";

export const toggleUserFormDrawer = (_payload, resolve, reject) => {
  return { type: TOGGLE_USER_FORM_DRAWER, payload: _payload };

}