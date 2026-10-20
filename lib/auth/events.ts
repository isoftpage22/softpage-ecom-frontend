/** Fired on window whenever the shopper signs in, signs out, or their session ends. */
export const STOREFRONT_AUTH_CHANGED = "storefront-auth-changed";

export function notifyStorefrontAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STOREFRONT_AUTH_CHANGED));
}
