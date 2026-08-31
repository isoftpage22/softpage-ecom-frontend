import type { Address, AddToCartInput } from "@/types/cart.types";
import type { CheckoutResult } from "@/types/order.types";
import { getGuestSessionId } from "@/lib/cart/session";
import { LIVE_SHIPPING_RATE_ID } from "@/lib/logisticsApi";
import { localAddressToCheckout, type LocalMenuAddress } from "@/lib/checkout/addressMapping";
import {
  buildCheckoutNotes,
  isDineInSession,
  type TableSession,
} from "@/lib/restaurant/table-session";
import { rtkErrorMessage } from "@/lib/auth/persistAuth";
import { isCartLockedError } from "@/lib/checkout/cartLock";

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
  replaceCartLines: MutateFn<
    {
      businessId: number;
      businessAppId: number;
      sessionId?: string;
      input: { lines: AddToCartInput[]; shippingAddress?: Address };
    },
    { id: string }
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
  abandonLockedCart?: MutateFn<
    {
      businessId: number;
      businessAppId: number;
      sessionId?: string;
      reason?: string;
    },
    boolean
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
  if (!opts.products?.length) {
    throw new Error("Cart is empty");
  }

  const sessionId = getGuestSessionId();
  const isDineIn = isDineInSession(opts.tableSession);
  const takeaway = opts.tableSession?.orderType === "takeaway";
  const payLater = isDineIn && opts.tableSession?.paymentTiming === "on_close";
  const needsDelivery = !isDineIn && !takeaway;

  let shippingAddress: Address | undefined;
  if (needsDelivery) {
    shippingAddress = localAddressToCheckout(
      (opts.usersAddress || {}) as LocalMenuAddress,
      opts.customer,
    );
    if (!shippingAddress.addressLine1 || !shippingAddress.postalCode) {
      throw new Error("Please add a delivery address");
    }
  }

  const replaceLines = () =>
    opts
      .replaceCartLines({
        businessId: opts.businessId,
        businessAppId: opts.businessAppId,
        sessionId,
        input: {
          lines: opts.products.map(lineToAddToCartInput),
          ...(shippingAddress ? { shippingAddress } : {}),
        },
      })
      .unwrap();

  let cart: { id: string };
  try {
    cart = await replaceLines();
  } catch (err) {
    if (!isCartLockedError(err) || !opts.abandonLockedCart) throw err;
    await opts
      .abandonLockedCart({
        businessId: opts.businessId,
        businessAppId: opts.businessAppId,
        sessionId,
        reason: "Payment cancelled",
      })
      .unwrap()
      .catch(() => undefined);
    cart = await replaceLines();
  }

  if (!cart?.id) {
    throw new Error("Could not create cart");
  }

  const notes = buildCheckoutNotes(opts.tableSession, opts.specialInstructions);
  const tip = Math.max(0, Number(opts.tip) || 0);

  return await opts
    .initiateCheckout({
      businessId: opts.businessId,
      cartId: cart.id,
      shippingRateId: needsDelivery ? LIVE_SHIPPING_RATE_ID : undefined,
      paymentMethod: payLater ? "cod" : "razorpay",
      notes,
      tableId: opts.tableSession?.tableId,
      channel: isDineIn
        ? opts.tableSession?.channel
        : takeaway
          ? opts.tableSession?.channel
          : "delivery",
      orderType: isDineIn
        ? opts.tableSession?.orderType
        : takeaway
          ? "takeaway"
          : "delivery",
      reservationId: opts.tableSession?.matchedReservationId,
      resourceId: opts.tableSession?.resourceId,
      tip: tip > 0 ? tip : undefined,
      payLater: payLater || undefined,
      returnOrigin: typeof window !== "undefined" ? window.location.href : undefined,
    })
    .unwrap();
}
