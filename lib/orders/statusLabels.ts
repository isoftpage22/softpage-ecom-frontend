export function normalizeStatus(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  created: "Placed",
  confirmed: "Confirmed",
  in_progress: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Payment pending",
  paid: "Paid",
  partially_paid: "Partially paid",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pending: "Looking for rider",
  quoted: "Looking for rider",
  created: "Looking for rider",
  accepted: "Looking for rider",
  assigned: "Rider assigned",
  picked_up: "Picked up",
  in_transit: "On the way",
  delivered: "Delivered",
  cancelled: "Delivery cancelled",
  failed: "Delivery failed",
  cancel_failed: "Delivery issue",
  rto: "Returning to store",
};

export function orderStatusLabel(value?: string | null): string {
  const key = normalizeStatus(value);
  return ORDER_STATUS_LABELS[key] || (value ? String(value) : "Order");
}

export function kitchenStatusLabel(value?: string | null): string {
  const key = normalizeStatus(value);
  if (key === "prepared") return "Kitchen ready";
  if (key === "preparing") return "Kitchen preparing";
  if (key === "pending") return "Waiting for kitchen";
  return "Kitchen";
}

export function orderLifecycleHeadline(order?: {
  status?: string | null;
  needsKitchen?: boolean | null;
  kitchenStatus?: string | null;
  deliveryStatus?: string | null;
} | null): string {
  if (!order) return "Order";
  if (isCancelledOrder(order.status)) return "Cancelled";
  if (normalizeStatus(order.status) === "completed") return "Completed";
  if (order.needsKitchen && normalizeStatus(order.kitchenStatus) !== "prepared") {
    return kitchenStatusLabel(order.kitchenStatus);
  }
  if (order.deliveryStatus) return deliveryStatusLabel(order.deliveryStatus);
  return orderStatusLabel(order.status);
}

export function paymentStatusLabel(value?: string | null): string {
  const key = normalizeStatus(value);
  return PAYMENT_STATUS_LABELS[key] || (value ? String(value) : "Payment");
}

export function deliveryStatusLabel(value?: string | null): string {
  const key = normalizeStatus(value);
  return DELIVERY_STATUS_LABELS[key] || "Delivery";
}

export function isCancelledOrder(status?: string | null): boolean {
  return normalizeStatus(status) === "cancelled";
}

export function isDeliveryOrder(order?: {
  orderType?: string | null;
  channel?: string | null;
  shippingCost?: number | null;
  shippingAddress?: { addressLine1?: string | null; postalCode?: string | null } | null;
} | null): boolean {
  if (!order) return false;
  const orderType = normalizeStatus(order.orderType);
  const channel = normalizeStatus(order.channel);
  if (orderType === "dine_in" || orderType === "takeaway" || channel === "qr_table") {
    return false;
  }
  if (orderType === "delivery" || channel === "delivery") return true;
  const line = String(order.shippingAddress?.addressLine1 || "").trim();
  const pin = String(order.shippingAddress?.postalCode || "").trim();
  return Boolean(line || pin) || Number(order.shippingCost) > 0;
}
