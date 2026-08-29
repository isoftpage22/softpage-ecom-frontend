export const PAYMENT_CONFIRM_TIMEOUT_MS = 120_000;

export function isCodLikePayment(method?: string | null): boolean {
  const value = (method || "").toLowerCase();
  return value === "cod" || value === "cash";
}

export function isServerPaid(status?: string | null): boolean {
  return (status || "").toLowerCase() === "paid";
}

export function paymentReturnFlags(search: {
  get?: (key: string) => string | null;
} | null): { paidHint: boolean; cancelled: boolean } {
  const paidHint =
    search?.get?.("paid") === "1" ||
    search?.get?.("success") === "true" ||
    search?.get?.("deposit") === "paid";
  const cancelled = search?.get?.("payment") === "cancelled";
  return { paidHint, cancelled };
}

export function shouldAwaitPayment(opts: {
  paidHint: boolean;
  cancelled: boolean;
  timedOut: boolean;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
}): boolean {
  if (opts.cancelled || opts.timedOut || !opts.paidHint) return false;
  if (isCodLikePayment(opts.paymentMethod)) return false;
  if (isServerPaid(opts.paymentStatus)) return false;
  return true;
}

function statusKey(value?: string | null): string {
  return String(value || "").trim().toLowerCase();
}

/** Unpaid prepaid (card/UPI) — Pay now on the same order. */
export function canResumeOnlinePayment(order?: {
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  orderType?: string | null;
  providerOrderId?: string | null;
} | null): boolean {
  if (!order) return false;
  if (statusKey(order.status) === "cancelled") return false;
  if (isServerPaid(order.paymentStatus)) return false;
  if (isCodLikePayment(order.paymentMethod)) return false;
  if (statusKey(order.orderType) === "dine_in" && !order.providerOrderId) return false;
  const pay = statusKey(order.paymentStatus);
  return pay === "unpaid" || pay === "partially_paid";
}

/** Paid or COD placed — Repeat into a new cart. */
export function canRepeatOrder(order?: {
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
} | null): boolean {
  if (!order) return false;
  if (statusKey(order.status) === "cancelled") return false;
  return isServerPaid(order.paymentStatus) || isCodLikePayment(order.paymentMethod);
}
