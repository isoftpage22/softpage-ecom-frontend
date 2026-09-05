import type { Address, CartAddon, CartComboSelection } from "./cart.types";

export interface OrderLineItem {
  id: string;
  name: string;
  slug?: string;
  media?: { id: string; url: string }[];
}

export interface OrderLineVariant {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface OrderLine {
  id: string;
  itemId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tax?: number;
  addons?: CartAddon[];
  comboSelections?: CartComboSelection[];
  notes?: string;
  item?: OrderLineItem | null;
  variant?: OrderLineVariant | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  channel?: string;
  orderType?: string;
  providerOrderId?: string;
  lines?: OrderLine[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  shippingCost?: number;
  serviceCharge?: number;
  tip?: number;
  total: number;
  currency: string;
  couponCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  kitchenStatus?: string;
  deliveryStatus?: string;
  needsKitchen?: boolean;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ShippingRate {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDeliveryDays?: string;
  currency: string;
}

export interface CheckoutResult {
  /**
   * Null while payment is outstanding: the order is created when money is
   * captured, so a failed payment leaves nothing to cancel and the cart stays
   * editable. Present for COD / pay-at-table / zero-total checkouts.
   */
  order: Order | null;
  /** Pass back to `confirmPayment` once Razorpay succeeds. */
  checkoutSessionId?: string;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  paymentRequired: boolean;
  paymentPageUrl?: string;
}

export type CheckoutSessionState = "pending" | "paid" | "failed" | "expired";

export interface CheckoutSessionStatus {
  id: string;
  status: CheckoutSessionState;
  orderId?: string | null;
  orderNumber?: string | null;
  amount: number;
  currency: string;
  expiresAt?: string | null;
}

export interface OrderTrackingPoint {
  lat: number;
  lng: number;
  label?: string;
  source?: string;
  at?: string;
}

export interface OrderTrackingScan {
  at?: string;
  activity?: string;
  location?: string;
  lat?: number;
  lng?: number;
}

export interface OrderTracking {
  orderId: string;
  status: string;
  provider?: string;
  providerLabel?: string;
  booked?: boolean;
  quotedProvider?: string;
  trackingId?: string;
  trackingUrl?: string;
  labelUrl?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  live: boolean;
  current?: OrderTrackingPoint | null;
  pickup?: OrderTrackingPoint | null;
  drop?: OrderTrackingPoint | null;
  scans: OrderTrackingScan[];
  message?: string;
}
