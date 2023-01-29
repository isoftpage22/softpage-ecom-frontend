import axios from 'axios';
import {getToken} from '../../utils/token';

const configuration = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': [
      'Origin', 'Accept', 'X-Requested-With', 'Content-Type', 'Authorization'
    ]
  }
};

const instance = axios.create({ configuration });

instance.interceptors.request.use((config) => {
  // const oAuthTokan = localStorage.getItem('token') || null;
  

  const token = getToken() || null;
  let newHeaders = config.headers;
  if (token) {
    
    newHeaders = Object.assign({}, newHeaders, { Authorization: `Bearer ${token}` });
  }
  

  return Object.assign({}, config, { headers: newHeaders });
}, (error) => Promise.reject(error));

const getAxios = () => instance;

export default getAxios;