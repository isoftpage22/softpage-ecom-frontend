import type { Address } from "@/types/cart.types";
import type { CustomerAddress, AddressInput } from "@/types/storefront-auth.types";
import { toCoord } from "@/lib/geo/coords";

export { toCoord } from "@/lib/geo/coords";

export type LocalMenuAddress = {
  id?: string | number;
  address1?: string;
  address2?: string;
  pincode?: string;
  landmark?: string;
  checkbox?: string;
  addressType?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  serverId?: number;
  label?: string;
};

function splitFullName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function addressLabel(saved: LocalMenuAddress): string | undefined {
  if (saved.checkbox === "Other") return saved.addressType || "Other";
  return saved.checkbox || saved.label || undefined;
}

export function localAddressToCheckout(
  saved: LocalMenuAddress,
  customer?: { customerName?: string; whatsAppNumber?: string },
): Address {
  const { firstName, lastName } = splitFullName(customer?.customerName);
  return {
    firstName: firstName || "Guest",
    lastName: lastName || "",
    addressLine1: saved.address1 || "",
    addressLine2: [saved.address2, saved.landmark].filter(Boolean).join(", ") || undefined,
    city: saved.city || "NA",
    state: saved.state || "NA",
    postalCode: String(saved.pincode || ""),
    country: saved.country || "India",
    phone: customer?.whatsAppNumber,
    latitude: toCoord(saved.latitude),
    longitude: toCoord(saved.longitude),
  };
}

export function localAddressToApiInput(
  saved: LocalMenuAddress,
  customer?: { customerName?: string; whatsAppNumber?: string },
): AddressInput {
  return {
    fullName: customer?.customerName,
    phone: customer?.whatsAppNumber,
    line1: saved.address1 || "",
    line2: saved.address2 || saved.landmark,
    city: saved.city,
    state: saved.state,
    postalCode: saved.pincode ? String(saved.pincode) : undefined,
    country: saved.country || "India",
    latitude: toCoord(saved.latitude),
    longitude: toCoord(saved.longitude),
    label: addressLabel(saved),
    isDefaultShipping: true,
    isDefaultBilling: true,
  };
}

export function customerAddressToLocal(saved: CustomerAddress): LocalMenuAddress {
  return {
    id: saved.id,
    serverId: saved.id,
    address1: saved.line1,
    address2: saved.line2 || "",
    pincode: saved.postalCode || "",
    landmark: "",
    checkbox: saved.label || "Home",
    label: saved.label || undefined,
    city: saved.city || "",
    state: saved.state || "",
    country: saved.country || "India",
    latitude: saved.latitude ?? undefined,
    longitude: saved.longitude ?? undefined,
  };
}
