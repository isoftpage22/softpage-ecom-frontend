"use client";

import { useCallback } from "react";
import { useBusinessId, useBusinessAppId } from "@/lib/tenant/TenantContext";
import {
  useAbandonCheckoutSessionMutation,
  useAbandonLockedCartMutation,
} from "@/store/api/ordersApi";
import { isCartLockedError } from "@/lib/checkout/cartLock";
import { getGuestSessionId } from "@/lib/cart/session";
import {
  clearPendingCheckoutSession,
  getPendingCheckoutSession,
} from "@/lib/checkout/pendingSession";

/**
 * Runs a cart mutation, and if the cart is locked by an in-flight payment
 * attempt, drops that attempt and tries once more. This is what makes "come
 * back from the payment page and edit the cart" work without the shopper
 * having to understand that a session exists at all.
 */
export function useCartUnlock() {
  const businessId = useBusinessId();
  const businessAppId = useBusinessAppId();
  const [abandonCheckoutSession] = useAbandonCheckoutSessionMutation();
  const [abandonLockedCart] = useAbandonLockedCartMutation();

  return useCallback(
    async <T>(run: () => Promise<T>): Promise<T> => {
      try {
        return await run();
      } catch (err) {
        if (!isCartLockedError(err)) throw err;
        const sessionId = getPendingCheckoutSession();
        clearPendingCheckoutSession();
        if (sessionId) {
          await abandonCheckoutSession({
            businessId,
            checkoutSessionId: sessionId,
            reason: "Shopper edited the cart",
          })
            .unwrap()
            .catch(() => undefined);
        } else {
          await abandonLockedCart({
            businessId,
            businessAppId,
            sessionId: getGuestSessionId(),
            reason: "Shopper edited the cart",
          })
            .unwrap()
            .catch(() => undefined);
        }
        return await run();
      }
    },
    [abandonCheckoutSession, abandonLockedCart, businessId, businessAppId],
  );
}
