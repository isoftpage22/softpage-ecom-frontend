"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useBusinessAppId, useBusinessId } from "@/lib/tenant/TenantContext";
import { useGuestSessionId } from "@/lib/cart/session";
import {
  useClearCartMutation,
  useGetCartQuery,
  useReplaceCartLinesMutation,
  useSetShippingRateMutation,
} from "@/store/api/cartApi";
import { lineToAddToCartInput, type MenuCartProduct } from "@/lib/checkout/placeMenuOrder";
import { localAddressToCheckout, type LocalMenuAddress } from "@/lib/checkout/addressMapping";
import { LIVE_SHIPPING_RATE_ID } from "@/lib/logisticsApi";
import { getTableSession, isDineInSession } from "@/lib/restaurant/table-session";
import { getUserInFromLocal } from "@/src/utils/CommonFunctions";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";

type LocalLine = MenuCartProduct & {
  lineKey?: string;
  total_amount?: number;
};

function productsSignature(products: LocalLine[] = [], shippingKey = "") {
  const lines = products
    .map((line) => `${line.lineKey || line.product_id}:${Number(line.quantity) || 0}`)
    .join("|");
  return `${lines}::${shippingKey}`;
}

function checkoutShippingAddress(usersAddress: LocalMenuAddress | Record<string, unknown>) {
  if (isDineInSession(getTableSession())) return undefined;
  const customer = getUserInFromLocal();
  const mapped = localAddressToCheckout(
    (usersAddress || {}) as LocalMenuAddress,
    Array.isArray(customer) ? {} : customer,
  );
  if (!mapped.addressLine1 || !mapped.postalCode) return undefined;
  return mapped;
}

/**
 * Cart-page only: copy Redux lines onto the GraphQL cart so bill, tax, coupon,
 * and platform shipping follow +/-. Home/product pages stay local.
 */
export function useSyncCartPage() {
  const businessId = useBusinessId();
  const businessAppId = useBusinessAppId();
  const sessionId = useGuestSessionId();
  const products = useSelector(
    (state: { shoppingCart?: { addToCart?: { products?: LocalLine[] } } }) =>
      state.shoppingCart?.addToCart?.products || [],
  );
  const usersAddress = useSelector(
    (state: { address?: { address?: LocalMenuAddress } }) => state.address?.address || {},
  );
  const shippingKey = [
    usersAddress?.pincode || usersAddress?.customerPincode || "",
    usersAddress?.latitude ?? "",
    usersAddress?.longitude ?? "",
  ].join("|");
  const signature = useMemo(
    () => productsSignature(products, shippingKey),
    [products, shippingKey],
  );
  const debouncedSignature = useDebouncedValue(signature, 300);
  const lastSynced = useRef("");
  const [pending, setPending] = useState(false);

  useLayoutEffect(() => {
    if (signature !== lastSynced.current) setPending(true);
  }, [signature]);

  const { data: serverCart } = useGetCartQuery(
    { businessId, businessAppId, sessionId },
    { skip: !businessId || !businessAppId || !sessionId },
  );
  const [replaceCartLines, replaceState] = useReplaceCartLinesMutation();
  const [setShippingRate, shippingState] = useSetShippingRateMutation();
  const [clearCart] = useClearCartMutation();

  const localQty = products.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const localSubtotal = Math.round(
    products.reduce((sum, line) => sum + (Number(line.total_amount) || 0), 0) * 100,
  ) / 100;
  const serverQty = Number(serverCart?.itemCount) || 0;
  const serverSubtotal = Math.round((Number(serverCart?.subtotal) || 0) * 100) / 100;
  const awaitingServer =
    localQty > 0 &&
    (!serverCart || serverQty !== localQty || serverSubtotal !== localSubtotal);

  useEffect(() => {
    if (!businessId || !businessAppId || !sessionId) return;
    if (debouncedSignature === lastSynced.current) return;

    let cancelled = false;

    const run = async () => {
      if (!products.length) {
        if (serverCart?.id) {
          try {
            await clearCart({ businessId, cartId: serverCart.id }).unwrap();
          } catch {
            /* page is leaving */
          }
        }
        if (!cancelled) {
          lastSynced.current = debouncedSignature;
          setPending(false);
        }
        return;
      }

      const shippingAddress = checkoutShippingAddress(usersAddress);

      try {
        const cart = await replaceCartLines({
          businessId,
          businessAppId,
          sessionId,
          input: {
            lines: products.map((line) => lineToAddToCartInput(line)),
            ...(shippingAddress ? { shippingAddress } : {}),
          },
        }).unwrap();
        if (shippingAddress && cart?.id) {
          try {
            await setShippingRate({
              businessId,
              cartId: cart.id,
              shippingRateId: LIVE_SHIPPING_RATE_ID,
            }).unwrap();
          } catch {
            /* quote on the bill still shows the REST rate */
          }
        }
        if (!cancelled) {
          lastSynced.current = debouncedSignature;
          setPending(false);
        }
      } catch {
        /* retry on the next signature change */
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    debouncedSignature,
    businessId,
    businessAppId,
    sessionId,
    products,
    usersAddress,
    serverCart?.id,
    replaceCartLines,
    setShippingRate,
    clearCart,
  ]);

  return {
    syncing:
      pending ||
      replaceState.isLoading ||
      shippingState.isLoading ||
      awaitingServer,
  };
}
