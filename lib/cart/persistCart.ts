export const MENU_CART_KEY = "MENU_CART";

export type ActiveOrderPhase = "processing" | "completed";

export type ActiveOrder = {
  orderId: string;
  orderNumber?: string | null;
  phase: ActiveOrderPhase;
};

export type PersistedMenuCart = {
  businessId?: number | null;
  products: unknown[];
  tip: number;
  specialInstructions: string;
  activeOrder: ActiveOrder | null;
};

export function emptyPersistedCart(
  businessId?: number | null,
): PersistedMenuCart {
  return {
    businessId: businessId ?? null,
    products: [],
    tip: 0,
    specialInstructions: "",
    activeOrder: null,
  };
}

export function loadMenuCart(): PersistedMenuCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MENU_CART_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMenuCart;
    if (!parsed || !Array.isArray(parsed.products)) return null;
    const phase = parsed.activeOrder?.phase;
    const activeOrder =
      parsed.activeOrder?.orderId &&
      (phase === "processing" || phase === "completed")
        ? {
            orderId: String(parsed.activeOrder.orderId),
            orderNumber: parsed.activeOrder.orderNumber || null,
            phase,
          }
        : null;
    return {
      businessId: parsed.businessId ?? null,
      products: parsed.products,
      tip: Number(parsed.tip) || 0,
      specialInstructions: String(parsed.specialInstructions || ""),
      activeOrder,
    };
  } catch {
    return null;
  }
}

export function saveMenuCart(cart: PersistedMenuCart): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MENU_CART_KEY, JSON.stringify(cart));
  } catch {
    // quota / private mode
  }
}

export function showsOrderBar(activeOrder?: ActiveOrder | null): boolean {
  return (
    Boolean(activeOrder?.orderId) &&
    (activeOrder?.phase === "processing" || activeOrder?.phase === "completed")
  );
}
