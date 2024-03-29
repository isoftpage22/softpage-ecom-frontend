import {
  API_INVOCATION,
  GET_PRODUCT_LIST
} from "../../actionTypes";
import * as constdata from "../../../utils/constants";
import * as consturl from "../../../utils/url";
import { getToken } from "../../../utils/token";

export const getProductsList = (_payload, resolve, reject) => {
  const url = `${consturl.BASE_URL}industries/currentUserIndustry`;
  const payload = {
      action: GET_PRODUCT_LIST,
      method: constdata.POST,
      apiConfig: {
          headers: {
              'Content-Type':'application/json',
              'Accept': 'application/json',
              'Authorization':getToken(),
              'Content-Type': 'application/json',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': [
                'Origin', 'Accept', 'X-Requested-With', 'Content-Type', 'Authorization',
              ]
          }
      },
      url: url,
      data: _payload,
      resolve,
      reject
  };
  return { type: API_INVOCATION, payload };
}