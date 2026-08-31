export const CART_LOCKED_CODE = "CART_LOCKED";

/**
 * The backend rejects cart edits while a payment attempt holds the cart. The
 * code travels inside the GraphQL error payload, so match on the serialized
 * error rather than guessing at its shape.
 */
export function isCartLockedError(err: unknown): boolean {
  if (!err) return false;
  try {
    return JSON.stringify(err).includes(CART_LOCKED_CODE);
  } catch {
    return false;
  }
}
