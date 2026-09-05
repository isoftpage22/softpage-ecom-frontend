import { LOADER_STATUS, ROUTE_LOADER_STATUS } from "../../actionTypes";

export const setLoader = (_payload) => {
  if (typeof _payload === "object" && _payload !== null) {
    return { type: LOADER_STATUS, payload: _payload };
  }
  return { type: LOADER_STATUS, payload: Boolean(_payload) };
};

export const setRouteLoading = (on) => ({
  type: ROUTE_LOADER_STATUS,
  payload: Boolean(on),
});

const ROUTE_LOADER_TIMEOUT_MS = 8000;
let dispatchRoute = null;
let routeLoaderTimer = null;

/** Called once from NavigationLoader so nav.js can dispatch without importing the store. */
export function bindRouteLoaderDispatch(dispatch) {
  dispatchRoute = dispatch;
}

export function shouldStartRouteLoading(url) {
  if (url == null || url === "") return true;
  const href = String(url);
  if (href.startsWith("#")) return false;
  if (typeof window === "undefined") return true;
  try {
    const next = new URL(href, window.location.href);
    const cur = new URL(window.location.href);
    return next.pathname !== cur.pathname || next.search !== cur.search;
  } catch {
    return true;
  }
}

export function startRouteLoading() {
  if (typeof window === "undefined") return;
  dispatchRoute?.(setRouteLoading(true));
  if (routeLoaderTimer) window.clearTimeout(routeLoaderTimer);
  routeLoaderTimer = window.setTimeout(() => {
    stopRouteLoading();
  }, ROUTE_LOADER_TIMEOUT_MS);
}

export function stopRouteLoading() {
  if (typeof window !== "undefined" && routeLoaderTimer) {
    window.clearTimeout(routeLoaderTimer);
    routeLoaderTimer = null;
  }
  dispatchRoute?.(setRouteLoading(false));
}
