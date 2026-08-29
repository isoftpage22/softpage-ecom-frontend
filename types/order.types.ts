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
  order: Order;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  paymentRequired: boolean;
  paymentPageUrl?: string;
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
