import type { Address } from "@/types/cart.types";
import type {
  CustomerAddress,
  AddressInput,
  AddressLabelType,
} from "@/types/storefront-auth.types";
import { toCoord } from "@/lib/geo/coords";

export { toCoord } from "@/lib/geo/coords";

export const ADDRESS_LABEL_CHIPS: { type: AddressLabelType; label: string }[] = [
  { type: "HOME", label: "Home" },
  { type: "WORK", label: "Work" },
  { type: "HOTEL", label: "Hotel" },
  { type: "OTHER", label: "Other" },
];

export type LocalMenuAddress = {
  id?: string | number;
  address1?: string;
  address2?: string;
  houseNumber?: string;
  floor?: string;
  tower?: string;
  societyName?: string;
  pincode?: string;
  customerPincode?: string;
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
  labelType?: AddressLabelType | string;
  fullName?: string;
  phone?: string;
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

export function inferLabelType(saved: {
  labelType?: string | null;
  label?: string | null;
  checkbox?: string | null;
}): AddressLabelType {
  const t = String(saved.labelType || "").toUpperCase();
  if (t === "HOME" || t === "WORK" || t === "HOTEL" || t === "OTHER") return t;
  const raw = String(saved.checkbox || saved.label || "").toLowerCase();
  if (raw === "home") return "HOME";
  if (raw === "work" || raw === "office") return "WORK";
  if (raw === "hotel") return "HOTEL";
  if (raw) return "OTHER";
  return "HOME";
}

export function labelFromType(
  type: AddressLabelType,
  custom?: string | null,
): string {
  if (type === "OTHER") return custom?.trim() || "Other";
  return ADDRESS_LABEL_CHIPS.find((chip) => chip.type === type)?.label || "Home";
}

export function formatStructuredAddress(parts: {
  houseNumber?: string | null;
  floor?: string | null;
  tower?: string | null;
  societyName?: string | null;
  street?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}): string {
  const floor = parts.floor?.trim()
    ? /floor/i.test(parts.floor)
      ? parts.floor.trim()
      : `Floor ${parts.floor.trim()}`
    : "";
  const head = [
    parts.houseNumber,
    floor,
    parts.tower,
    parts.societyName,
    parts.street,
    parts.landmark ? `Near ${parts.landmark}` : "",
  ].filter(Boolean);
  const tail = [parts.city, parts.state, parts.postalCode].filter(Boolean).join(" ");
  return [...head, tail].filter(Boolean).join(", ");
}

export function localAddressToCheckout(
  saved: LocalMenuAddress,
  customer?: { customerName?: string; whatsAppNumber?: string },
): Address {
  const fullName = saved.fullName || customer?.customerName;
  const { firstName, lastName } = splitFullName(fullName);
  const labelType = inferLabelType(saved);
  return {
    firstName: firstName || "Guest",
    lastName: lastName || "",
    addressLine1: saved.address1 || saved.houseNumber || "",
    addressLine2: saved.address2 || undefined,
    houseNumber: saved.houseNumber || undefined,
    floor: saved.floor || undefined,
    tower: saved.tower || undefined,
    societyName: saved.societyName || undefined,
    landmark: saved.landmark || undefined,
    label: labelFromType(labelType, saved.addressType || saved.label),
    labelType,
    city: saved.city || "NA",
    state: saved.state || "NA",
    postalCode: String(saved.pincode || ""),
    country: saved.country || "India",
    phone: saved.phone || customer?.whatsAppNumber,
    latitude: toCoord(saved.latitude),
    longitude: toCoord(saved.longitude),
  };
}

export function localAddressToApiInput(
  saved: LocalMenuAddress,
  customer?: { customerName?: string; whatsAppNumber?: string },
): AddressInput {
  const labelType = inferLabelType(saved);
  return {
    fullName: saved.fullName || customer?.customerName,
    phone: saved.phone || customer?.whatsAppNumber,
    line1: saved.address1 || saved.houseNumber || "",
    line2: saved.address2 || undefined,
    houseNumber: saved.houseNumber || undefined,
    floor: saved.floor || undefined,
    tower: saved.tower || undefined,
    societyName: saved.societyName || undefined,
    landmark: saved.landmark || undefined,
    city: saved.city,
    state: saved.state,
    postalCode: saved.pincode ? String(saved.pincode) : undefined,
    country: saved.country || "India",
    latitude: toCoord(saved.latitude),
    longitude: toCoord(saved.longitude),
    label: labelFromType(labelType, saved.addressType || saved.label),
    labelType,
    isDefaultShipping: true,
    isDefaultBilling: true,
  };
}

export function customerAddressToLocal(saved: CustomerAddress): LocalMenuAddress {
  const labelType = inferLabelType(saved);
  return {
    id: saved.id,
    serverId: saved.id,
    address1: saved.line1,
    address2: saved.line2 || "",
    houseNumber: saved.houseNumber || "",
    floor: saved.floor || "",
    tower: saved.tower || "",
    societyName: saved.societyName || "",
    pincode: saved.postalCode || "",
    landmark: saved.landmark || "",
    checkbox: labelFromType(labelType, saved.label),
    addressType: labelType === "OTHER" ? saved.label || "" : "",
    label: saved.label || undefined,
    labelType,
    fullName: saved.fullName || "",
    phone: saved.phone || "",
    city: saved.city || "",
    state: saved.state || "",
    country: saved.country || "India",
    latitude: saved.latitude ?? undefined,
    longitude: saved.longitude ?? undefined,
  };
}
