import { formatClock, type BusinessHours } from "@/lib/store/operationalHours";
import type { StorefrontAddress, StorefrontContact, StorefrontSocial } from "@/lib/tenant/TenantContext";

const WEEK = [
  ["monday", "Mon"],
  ["tuesday", "Tue"],
  ["wednesday", "Wed"],
  ["thursday", "Thu"],
  ["friday", "Fri"],
  ["saturday", "Sat"],
  ["sunday", "Sun"],
] as const;

export type HoursRow = { days: string; hours: string };

/** Opening hours grouped into runs of days, e.g. "Mon – Fri  11:00 AM – 11:00 PM" or "Every day  Open 24 hours". */
export function weeklyHours(hours?: BusinessHours | null): HoursRow[] {
  if (!hours) return [];
  const daily = WEEK.map(([key, short]) => {
    const day = hours[key];
    const open = formatClock(day?.openTime);
    const close = formatClock(day?.closeTime);
    const allDay = open && (open === close || (open === "12:00 AM" && close === "11:59 PM"));
    const value = !day ? "" : day.isOpen === false ? "Closed" : allDay ? "Open 24 hours" : open && close ? `${open} – ${close}` : "";
    return { short, value };
  });
  if (!daily.some((day) => day.value && day.value !== "Closed")) return [];
  const rows: HoursRow[] = [];
  let start = 0;
  for (let i = 1; i <= daily.length; i += 1) {
    if (i < daily.length && daily[i].value === daily[start].value) continue;
    const value = daily[start].value;
    if (value) {
      const days = i - 1 === start ? daily[start].short : `${daily[start].short} – ${daily[i - 1].short}`;
      rows.push({ days: start === 0 && i === daily.length ? "Every day" : days, hours: value });
    }
    start = i;
  }
  return rows;
}

export function contactPhone(contact?: StorefrontContact | null): string {
  return String(contact?.supportPhone || contact?.phone || contact?.phones?.primary || "").trim();
}

export function contactEmail(contact?: StorefrontContact | null): string {
  return String(contact?.supportEmail || contact?.email || contact?.emails?.primary || "").trim();
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function fullAddress(address?: StorefrontAddress | string | null): string {
  if (!address) return "";
  if (typeof address === "string") return address.trim();
  return (
    address.formatted?.trim() ||
    [address.line1, address.line2, address.city, address.state, address.zip].filter(Boolean).join(", ")
  );
}

/** Google Maps link for the store: exact pin when we have coordinates, else the address. */
export function mapsHref(address?: StorefrontAddress | string | null): string {
  if (address && typeof address === "object" && Number(address.latitude) && Number(address.longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
  }
  const line = fullAddress(address);
  return line ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(line)}` : "";
}

export const SOCIAL_LABELS: Record<keyof StorefrontSocial, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
};

export function socialLinks(social?: Partial<StorefrontSocial> | null): Array<{ key: string; label: string; href: string }> {
  return (Object.keys(SOCIAL_LABELS) as Array<keyof StorefrontSocial>)
    .map((key) => ({ key, label: SOCIAL_LABELS[key], href: String(social?.[key] || "").trim() }))
    .filter((item) => /^https?:\/\//i.test(item.href));
}
