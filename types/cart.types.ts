export interface CartAddon {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartComboSelection {
  groupId: string;
  groupName: string;
  componentId: string;
  componentItemId: string;
  componentName: string;
  variantId?: string;
  quantity: number;
  priceDelta: number;
}

export interface CartItem {
  id: string;
  itemId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tax: number;
  notes?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export interface Cart {
  id: string;
  status: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  shippingCost: number;
  selectedShippingRateId?: string | null;
  total: number;
  currency: string;
  appliedCoupon?: {
    code: string;
    name?: string;
    type?: string;
    discountAmount?: number;
  } | null;
  shippingAddress?: Address;
  notes?: string;
}

export interface AddToCartInput {
  itemId: string;
  variantId?: string;
  quantity: number;
  addons?: CartAddon[];
  comboSelections?: CartComboSelection[];
  notes?: string;
}
