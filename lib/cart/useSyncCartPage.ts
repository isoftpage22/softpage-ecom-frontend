"use client";

import { useEffect, useMemo, useRef } from "react";
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

  const { data: serverCart } = useGetCartQuery(
    { businessId, businessAppId, sessionId },
    { skip: !businessId || !businessAppId || !sessionId },
  );
  const [replaceCartLines] = useReplaceCartLinesMutation();
  const [setShippingRate] = useSetShippingRateMutation();
  const [clearCart] = useClearCartMutation();

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
        if (!cancelled) lastSynced.current = debouncedSignature;
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
        if (!cancelled) lastSynced.current = debouncedSignature;
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
}
