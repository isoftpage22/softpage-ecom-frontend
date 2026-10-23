import type { StorefrontPaymentConfig } from "@/lib/tenant/TenantContext";

/** Matches the backend's TOO_LARGE_FOR_DELIVERY message. */
export const TOO_LARGE_PATTERN = /too large for delivery/i;

export type OrderRulesCheck = {
  /** Store's item cap when this cart is over it; checkout must stop. */
  itemCapExceeded: number | null;
  /** Cash on delivery cap when this cart is over it. */
  codCapExceeded: number | null;
  /** The store confirms large orders and their ready time before preparing. */
  needsStoreConfirmation: boolean;
};

/** Mirrors the backend checkout rules (units and subtotal) so customers see them before paying. */
export function checkOrderRules(
  payment: Partial<StorefrontPaymentConfig> | null | undefined,
  cart: { itemCount?: number | null; subtotal?: number | null } | null | undefined,
): OrderRulesCheck {
  const units = Number(cart?.itemCount) || 0;
  const value = Number(cart?.subtotal) || 0;
  const large = payment?.largeOrder ?? null;
  const cap = large?.maxItemsPerOrder ?? null;
  const codMax = payment?.codMaxOrderValue ?? null;
  const isLarge =
    !!large &&
    ((large.minItems != null && units >= large.minItems) || (large.minValue != null && value >= large.minValue));
  return {
    itemCapExceeded: cap != null && units > cap ? cap : null,
    codCapExceeded: codMax != null && value > codMax ? codMax : null,
    needsStoreConfirmation: isLarge && Boolean(large?.requireAcceptance),
  };
}

/** "30–40 min" from the range the backend locked with the delivery fee. */
export function formatEtaRange(min?: number | null, max?: number | null): string | null {
  if (min == null || max == null || !(min > 0) || !(max >= min)) return null;
  if (max <= 90) return `${min}–${max} min`;
  const hours = Math.max(1, Math.round((min + max) / 2 / 60));
  return hours === 1 ? "about 1 hr" : `about ${hours} hr`;
}
