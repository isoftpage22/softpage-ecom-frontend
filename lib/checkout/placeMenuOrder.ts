import type { Address, AddToCartInput } from "@/types/cart.types";
import type { CheckoutResult } from "@/types/order.types";
import { getGuestSessionId } from "@/lib/cart/session";
import { fetchShippingQuote } from "@/lib/logisticsApi";
import { localAddressToCheckout, type LocalMenuAddress } from "@/lib/checkout/addressMapping";
import {
  buildCheckoutNotes,
  isDineInSession,
  type TableSession,
} from "@/lib/restaurant/table-session";
import { rtkErrorMessage } from "@/lib/auth/persistAuth";

export type MenuCartProduct = {
  product_id: string | number;
  quantity: number;
  variantId?: string | null;
  addons?: AddToCartInput["addons"];
  comboSelections?: AddToCartInput["comboSelections"];
};

export function lineToAddToCartInput(line: MenuCartProduct): AddToCartInput {
  const addons = (line.addons || [])
    .filter((addon) => addon?.groupId && addon?.optionId)
    .map((addon) => ({
      groupId: String(addon.groupId),
      groupName: String(addon.groupName || ""),
      optionId: String(addon.optionId),
      optionName: String(addon.optionName || ""),
      price: Number(addon.price) || 0,
    }));
  const comboSelections = (line.comboSelections || [])
    .filter((combo) => combo?.groupId && combo?.componentId && combo?.componentItemId)
    .map((combo) => ({
      groupId: String(combo.groupId),
      groupName: String(combo.groupName || ""),
      componentId: String(combo.componentId),
      componentItemId: String(combo.componentItemId),
      componentName: String(combo.componentName || ""),
      ...(combo.variantId ? { variantId: String(combo.variantId) } : {}),
      quantity: Math.max(1, Number(combo.quantity) || 1),
      priceDelta: Number(combo.priceDelta) || 0,
    }));

  return {
    itemId: String(line.product_id),
    quantity: Number(line.quantity) || 1,
    ...(line.variantId ? { variantId: String(line.variantId) } : {}),
    ...(addons.length ? { addons } : {}),
    ...(comboSelections.length ? { comboSelections } : {}),
  };
}

type MutateFn<Arg, Result> = (arg: Arg) => { unwrap: () => Promise<Result> };

export async function placeMenuOrder(opts: {
  businessId: number;
  businessAppId: number;
  products: MenuCartProduct[];
  tableSession: TableSession | null;
  usersAddress?: LocalMenuAddress | Record<string, unknown>;
  customer?: { customerName?: string; whatsAppNumber?: string };
  tip?: number;
  specialInstructions?: string;
  storeSlug?: string | null;
  orderValue?: number;
  getCart: MutateFn<
    { businessId: number; businessAppId: number; sessionId?: string },
    { id: string; items?: { id: string }[] } | null
  >;
  addToCart: MutateFn<
    {
      businessId: number;
      businessAppId: number;
      sessionId?: string;
      input: AddToCartInput;
    },
    { id: string }
  >;
  clearCart: MutateFn<{ businessId: number; cartId: string }, unknown>;
  setShippingAddress: MutateFn<
    { businessId: number; cartId: string; shippingAddress: Address; sameAsBilling?: boolean },
    unknown
  >;
  setShippingRate: MutateFn<
    { businessId: number; cartId: string; shippingRateId: string },
    unknown
  >;
  getShippingRates: MutateFn<
    {
      businessId: number;
      postalCode?: string;
      country?: string;
      orderValue?: number;
      lat?: number;
      lng?: number;
    },
    { id: string }[] | null
  >;
  initiateCheckout: MutateFn<
    {
      businessId: number;
      cartId: string;
      shippingRateId?: string;
      paymentMethod?: string;
      notes?: string;
      tableId?: string;
      channel?: string;
      orderType?: string;
      reservationId?: string;
      resourceId?: string;
      tip?: number;
      payLater?: boolean;
      returnOrigin?: string;
    },
    CheckoutResult
  >;
}): Promise<CheckoutResult> {
  try {
    return await runPlaceMenuOrder(opts);
  } catch (err) {
    throw new Error(rtkErrorMessage(err, "Could not place order"));
  }
}

async function runPlaceMenuOrder(
  opts: Parameters<typeof placeMenuOrder>[0],
): Promise<CheckoutResult> {
  const sessionId = getGuestSessionId();
  const isDineIn = isDineInSession(opts.tableSession);
  const payLater = isDineIn && opts.tableSession?.paymentTiming === "on_close";

  let cart = await opts
    .getCart({
      businessId: opts.businessId,
      businessAppId: opts.businessAppId,
      sessionId,
    })
    .unwrap()
    .catch(() => null);

  if (cart?.id && (cart.items?.length || 0) > 0) {
    await opts.clearCart({ businessId: opts.businessId, cartId: cart.id }).unwrap();
  }

  let cartId = cart?.id;
  for (const line of opts.products) {
    const added = await opts
      .addToCart({
        businessId: opts.businessId,
        businessAppId: opts.businessAppId,
        sessionId,
        input: lineToAddToCartInput(line),
      })
      .unwrap();
    cartId = added.id;
  }

  if (!cartId) {
    throw new Error("Could not create cart");
  }

  let shippingRateId: string | undefined;
  if (!isDineIn) {
    const shippingAddress = localAddressToCheckout(
      (opts.usersAddress || {}) as LocalMenuAddress,
      opts.customer,
    );
    if (!shippingAddress.addressLine1 || !shippingAddress.postalCode) {
      throw new Error("Please add a delivery address");
    }

    if (opts.storeSlug) {
      const quote = await fetchShippingQuote({
        store: opts.storeSlug,
        pincode: shippingAddress.postalCode,
        lat: shippingAddress.latitude,
        lng: shippingAddress.longitude,
        orderValue: opts.orderValue,
      });
      if (quote && quote.serviceable === false) {
        throw new Error("This address is not in the delivery area");
      }
    }

    await opts
      .setShippingAddress({
        businessId: opts.businessId,
        cartId,
        shippingAddress,
        sameAsBilling: true,
      })
      .unwrap();

    const rates = await opts
      .getShippingRates({
        businessId: opts.businessId,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        orderValue: opts.orderValue,
        lat: shippingAddress.latitude,
        lng: shippingAddress.longitude,
      })
      .unwrap()
      .catch(() => []);

    if (!rates?.length) {
      throw new Error("Delivery is not available for this address");
    }
    shippingRateId = rates[0].id;
    await opts
      .setShippingRate({
        businessId: opts.businessId,
        cartId,
        shippingRateId,
      })
      .unwrap();
  }

  const notes = buildCheckoutNotes(opts.tableSession, opts.specialInstructions);
  const tip = Math.max(0, Number(opts.tip) || 0);

  return await opts
    .initiateCheckout({
      businessId: opts.businessId,
      cartId,
      shippingRateId,
      paymentMethod: payLater ? "cod" : "razorpay",
      notes,
      tableId: opts.tableSession?.tableId,
      channel: opts.tableSession?.channel,
      orderType: opts.tableSession?.orderType,
      reservationId: opts.tableSession?.matchedReservationId,
      resourceId: opts.tableSession?.resourceId,
      tip: tip > 0 ? tip : undefined,
      payLater: payLater || undefined,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    })
    .unwrap();
}
