/** Per-item order limits set by the store (min/max units in one order). */
export type QtyLimited = { minOrderQty?: number | null; maxOrderQty?: number | null } | null | undefined;

export function qtyBounds(item: QtyLimited): { min: number; max: number } {
  const min = Math.max(1, Math.floor(Number(item?.minOrderQty) || 1));
  const rawMax = Number(item?.maxOrderQty);
  const max = Number.isFinite(rawMax) && rawMax >= 1 ? Math.max(min, Math.floor(rawMax)) : Infinity;
  return { min, max };
}

export function clampQty(qty: number, item: QtyLimited): number {
  const { min, max } = qtyBounds(item);
  return Math.min(max, Math.max(min, qty));
}

export function isAtMax(qty: number, item: QtyLimited): boolean {
  return qty >= qtyBounds(item).max;
}

/** Quantity after one "−" press; 0 means the line should be removed (it would drop below the minimum). */
export function qtyAfterDecrement(qty: number, item: QtyLimited): number {
  return qty - 1 < qtyBounds(item).min ? 0 : qty - 1;
}

/** Short note for the item, e.g. "Min 2 per order" or "2–10 per order". */
export function qtyLimitLabel(item: QtyLimited): string | null {
  const { min, max } = qtyBounds(item);
  if (min > 1 && Number.isFinite(max)) return min === max ? `Sold in ${min}s only` : `${min}–${max} per order`;
  if (min > 1) return `Min ${min} per order`;
  if (Number.isFinite(max)) return `Max ${max} per order`;
  return null;
}

/** Units of one catalog item across all its cart lines (variants, add-ons). */
export function cartQtyForProduct(
  lines: Array<{ product_id?: string | number; quantity?: number | string }> | null | undefined,
  productId: string | number | null | undefined,
): number {
  if (productId == null) return 0;
  return (lines || []).reduce(
    (sum, line) => (String(line.product_id) === String(productId) ? sum + (Number(line.quantity) || 0) : sum),
    0,
  );
}
