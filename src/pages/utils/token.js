import Cookies from "js-cookie";
// import { MIN_CART_VALUE, EXPRESS_DELIVERY_CHARGE } from "./constants";
export const getToken = () => {
  let allcookies = document.cookie.split(";");
  let token = "";
  for (let i = 0; i < allcookies.length; i++) {
    if (allcookies[i].split("=")[0].trim() === "kees_customer_access_token") {
      token = allcookies[i].split("=")[1];
    }
  }

  return token;
};

export const getRefreshToken = () => {
  return Cookies.get("refreshToken");
};

export const updateToken = (result) => {
  var inFifteenMinutes = new Date(new Date().getTime() + 58 * 60 * 1000);
  Cookies.set("kees_customer_access_token", result.user._lat, {
    expires: inFifteenMinutes,
  });
};

export const logout = () => {
  Cookies.remove("kees_customer_access_token");
  Cookies.remove("refreshToken");
  // localStorage.removeItem(MIN_CART_VALUE);
  // localStorage.removeItem(EXPRESS_DELIVERY_CHARGE);
  localStorage.removeItem("locationName");

  localStorage.removeItem("geo_latitude");
  localStorage.removeItem("geo_longitude");

  localStorage.removeItem("store_id");
  // return firebase.auth().signOut();
};
