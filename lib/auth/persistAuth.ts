import { cancelStorefrontTokenRefresh } from "@/lib/api/graphqlBaseQuery";
import { ordersApi } from "@/store/api/ordersApi";
import { reservationsApi } from "@/store/api/reservationsApi";
import { storefrontAuthApi } from "@/store/api/storefrontAuthApi";
import { saveUsersAddress } from "@/src/Store/action/addresses";
import { store } from "@/src/Store";
import {
  CUSTOMER_INFO,
  LOCAL_STORAGE_CUSTOMER_ADDRESS,
  SELECTED_CUSTOMER_ADDRESS,
} from "@/src/utils/constants";
import type { AuthResult } from "@/types/storefront-auth.types";

export { rtkErrorMessage } from "@/lib/api/userFacingError";

export const STOREFRONT_AUTH_CHANGED = "storefront-auth-changed";
const POST_AUTH_REDIRECT_KEY = "storefrontPostAuthRedirect";

function notifyStorefrontAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STOREFRONT_AUTH_CHANGED));
}

function clearSavedAddresses() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_STORAGE_CUSTOMER_ADDRESS);
  localStorage.removeItem(SELECTED_CUSTOMER_ADDRESS);
  store.dispatch(saveUsersAddress({}));
}

function resetCustomerCaches() {
  store.dispatch(storefrontAuthApi.util.resetApiState());
  store.dispatch(ordersApi.util.resetApiState());
  store.dispatch(reservationsApi.util.resetApiState());
}

export function setPostAuthRedirect(path: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, path);
}

export function consumePostAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const path = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export function persistStorefrontAuth(
  result: AuthResult,
  formValues?: { customerName?: string; whatsAppNumber?: string },
) {
  if (typeof window === "undefined") return;
  const hadSession = Boolean(
    localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"),
  );
  if (hadSession) clearSavedAddresses();
  const tokens = result?.tokens;
  if (tokens?.accessToken) {
    localStorage.setItem("accessToken", tokens.accessToken);
  }
  if (tokens?.refreshToken) {
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }
  const name =
    formValues?.customerName ||
    result?.profile?.fullName ||
    result?.profile?.displayName ||
    [result?.profile?.firstName, result?.profile?.lastName].filter(Boolean).join(" ") ||
    "";
  const phone =
    formValues?.whatsAppNumber ||
    result?.identity?.phone ||
    result?.profile?.phone ||
    "";
  localStorage.setItem(
    CUSTOMER_INFO,
    JSON.stringify({
      customerName: name,
      whatsAppNumber: String(phone).replace(/\D/g, "").slice(-10),
      countryCode: 91,
    }),
  );
  resetCustomerCaches();
  notifyStorefrontAuthChanged();
}

export function hasStorefrontToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("accessToken"));
}

export function isStorefrontLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("accessToken") || localStorage.getItem(CUSTOMER_INFO));
}

export function clearStorefrontAuth(): void {
  if (typeof window === "undefined") return;
  cancelStorefrontTokenRefresh();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem(CUSTOMER_INFO);
  clearSavedAddresses();
  resetCustomerCaches();
  notifyStorefrontAuthChanged();
}

export function isRegistrationRequired(err: unknown): boolean {
  return JSON.stringify(err || "").includes("REGISTRATION_REQUIRED");
}
