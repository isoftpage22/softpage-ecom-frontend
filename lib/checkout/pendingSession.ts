const PENDING_SESSION_KEY = "MENU_PENDING_CHECKOUT_SESSION";

/**
 * The checkout session of an in-flight payment attempt. Kept outside the cart
 * state because editing the cart clears the order bar, and we still need the id
 * afterwards to release the server-side cart lock and stock hold.
 */
export function setPendingCheckoutSession(sessionId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionId) {
      window.sessionStorage.setItem(PENDING_SESSION_KEY, sessionId);
    } else {
      window.sessionStorage.removeItem(PENDING_SESSION_KEY);
    }
  } catch {
    // private mode / quota
  }
}

export function getPendingCheckoutSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(PENDING_SESSION_KEY) || null;
  } catch {
    return null;
  }
}

export function clearPendingCheckoutSession(): void {
  setPendingCheckoutSession(null);
}

/**
 * Hosted-pay cancel lands on /cart?payment=cancelled. Cleanup must run once
 * for that visit: Place order writes a new pending session, and repeating
 * this would abandon the new charge before Razorpay opens.
 */
let cartCancelCleanupStarted = false;

export function beginCartCancelCleanup(): boolean {
  if (cartCancelCleanupStarted) return false;
  cartCancelCleanupStarted = true;
  return true;
}

export function resetCartCancelCleanup(): void {
  cartCancelCleanupStarted = false;
}
