import { CUSTOMER_INFO } from "@/src/utils/constants";
import type { AuthResult } from "@/types/storefront-auth.types";

export { rtkErrorMessage } from "@/lib/api/userFacingError";

export const STOREFRONT_AUTH_CHANGED = "storefront-auth-changed";
const POST_AUTH_REDIRECT_KEY = "storefrontPostAuthRedirect";

function notifyStorefrontAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STOREFRONT_AUTH_CHANGED));
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
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem(CUSTOMER_INFO);
  notifyStorefrontAuthChanged();
}

export function isRegistrationRequired(err: unknown): boolean {
  return JSON.stringify(err || "").includes("REGISTRATION_REQUIRED");
}
