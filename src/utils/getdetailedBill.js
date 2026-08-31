function roundPaise(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/** Rupee label without binary float junk (`410.53000000000003`). */
export function formatRupee(value) {
  const amount = roundPaise(value);
  if (Number.isInteger(amount)) return String(amount);
  return amount.toFixed(2);
}

/**
 * Same GST split as the cart service: inclusive extracts tax from the line
 * total; exclusive adds rate on top. Missing catalog flags default to the
 * usual restaurant card (18% inclusive) so the bill does not jump after GraphQL.
 */
export function taxOnLineTotal(totalPrice, product = {}) {
  const total = Number(totalPrice) || 0;
  if (total <= 0) return 0;
  const ratePct = Number(product.taxClass);
  const taxRate = (Number.isFinite(ratePct) && ratePct > 0 ? ratePct : 18) / 100;
  const inclusive = product.taxInclusive !== false;
  if (inclusive) return total - total / (1 + taxRate);
  return total * taxRate;
}

export function estimateMenuTax(lines = []) {
  return roundPaise(
    (lines || []).reduce((sum, line) => {
      return sum + taxOnLineTotal(line?.total_amount ?? line?.totalPrice, line?.product);
    }, 0),
  );
}

/**
 * Cart bill for the menu checkout page.
 * Item total follows the local cart immediately; coupon comes from the server.
 * Tax matches the GraphQL cart formula so +/- does not flash a different GST.
 */
export function buildMenuBill({
  cart = null,
  tip = 0,
  deliveryFee = 0,
  fallbackSubtotal,
  lines = [],
} = {}) {
  const hasFallback = fallbackSubtotal != null && fallbackSubtotal !== "";
  const subtotal = roundPaise(
    hasFallback ? Number(fallbackSubtotal) || 0 : Number(cart?.subtotal) || 0,
  );
  const couponDiscount = roundPaise(Number(cart?.discount) || 0);
  const serverSubtotal = roundPaise(Number(cart?.subtotal) || 0);
  const serverTax = Number(cart?.tax) || 0;
  const estimatedTax = estimateMenuTax(lines);
  const taxAmount = roundPaise(
    serverTax && serverSubtotal === subtotal
      ? serverTax
      : estimatedTax,
  );
  const shipping = roundPaise(Number(deliveryFee) || 0);
  const tipAmount = roundPaise(Number(tip) || 0);
  const totalFinalPriceAmount = roundPaise(
    Math.max(0, subtotal + taxAmount + shipping + tipAmount - couponDiscount),
  );

  return {
    qty: cart?.itemCount,
    totalAmount: subtotal,
    discountType: couponDiscount > 0 ? "coupon" : null,
    discountRate: 0,
    discount: couponDiscount,
    couponDiscount,
    priceAfterDiscount: roundPaise(Math.max(0, subtotal - couponDiscount)),
    taxAmount,
    CGST: Math.round(taxAmount / 2),
    SGST: Math.round(taxAmount / 2),
    tip: tipAmount,
    deliveryFee: shipping,
    totalFinalPriceAmount,
  };
}

/** @deprecated Use buildMenuBill. Kept so leftover callers do not apply a fake 18% off. */
export const getDetailBill = (_addToCart, _discType, _discountVal, tip = 0, deliveryFee = 0) => {
  const products = _addToCart?.products || [];
  const fallbackSubtotal = products.reduce((total, item) => {
    return Math.ceil(total + (Number(item.total_amount) || 0));
  }, 0);
  return buildMenuBill({
    cart: null,
    tip,
    deliveryFee,
    fallbackSubtotal,
    lines: products,
  });
};
