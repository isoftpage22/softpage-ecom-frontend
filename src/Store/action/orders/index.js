import {
    API_INVOCATION,
    CREATE_ORDER,
    GET_PRODUCT_LIST
  } from "../../actionTypes";
  import * as constdata from "../../../utils/constants";
  import * as consturl from "../../../utils/url";
  import { getToken } from "../../../utils/token";
  
  export const createOrder = (_payload, resolve, reject) => {
    const url = `${consturl.BASE_URL}order`;
    const payload = {
        action: CREATE_ORDER,
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
        data:_payload,
        url: url,
        resolve,
        reject
    };
    return { type: API_INVOCATION, payload };
  }