"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { hydrateCart } from "@/src/Store/action/shoppingCart";
import { saveUsersAddress } from "@/src/Store/action/addresses";
import { getCurrentAddres } from "@/src/utils/CommonFunctions";
import {
  emptyPersistedCart,
  loadMenuCart,
  saveMenuCart,
} from "@/lib/cart/persistCart";

/** Rehydrate cart/address after refresh and keep MENU_CART in localStorage. */
export function PersistMenuCart() {
  const dispatch = useDispatch();
  const businessId = useBusinessId();
  const shoppingCart = useSelector((state) => state.shoppingCart);
  const ready = useRef(false);

  useLayoutEffect(() => {
    const stored = loadMenuCart();
    if (
      stored?.businessId &&
      businessId &&
      Number(stored.businessId) !== Number(businessId)
    ) {
      dispatch(hydrateCart(emptyPersistedCart(businessId)));
    } else if (stored) {
      dispatch(hydrateCart(stored));
    }
    const address = getCurrentAddres();
    if (address && typeof address === "object" && Object.keys(address).length > 0) {
      dispatch(saveUsersAddress(address));
    }
    ready.current = true;
  }, [businessId, dispatch]);

  useEffect(() => {
    if (!ready.current) return;
    saveMenuCart({
      businessId: businessId || null,
      products: shoppingCart?.addToCart?.products || [],
      tip: shoppingCart?.tip || 0,
      specialInstructions: shoppingCart?.specialInstructions || "",
      activeOrder: shoppingCart?.activeOrder || null,
    });
  }, [
    businessId,
    shoppingCart?.addToCart?.products,
    shoppingCart?.tip,
    shoppingCart?.specialInstructions,
    shoppingCart?.activeOrder,
  ]);

  return null;
}
