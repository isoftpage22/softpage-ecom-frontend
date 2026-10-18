/**
 * WhatsApp chat → storefront handoff. Links sent from a store's WhatsApp chat
 * carry `?wa=<signed token>`. We keep it for the visit, pre-fill the phone, and
 * send it with checkout so the backend (which verifies the signature) files the
 * order under that chat: confirmation and tracking then arrive on WhatsApp.
 */

export interface WhatsappHandoff {
  token: string;
  businessId: number;
  /** Customer's WhatsApp number, digits with country code. */
  waId: string;
  /** The store's WhatsApp number, digits, for "Back to WhatsApp". */
  phone: string | null;
  /** Expiry, seconds since epoch. */
  exp: number;
}

export const HANDOFF_STORAGE_KEY = "sp_wa_handoff";
const PARAM = "wa";

function decodePart(part: string): Record<string, unknown> | null {
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Reads the public claims. The signature is checked by the backend, never here. */
export function decodeHandoff(token: string): WhatsappHandoff | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const claims = decodePart(parts[1]);
  if (!claims || claims.typ !== "wa_handoff") return null;
  const waId = String(claims.wa || "").replace(/\D/g, "");
  const businessId = Number(claims.bid);
  const exp = Number(claims.exp);
  if (waId.length < 10 || !Number.isFinite(businessId) || !Number.isFinite(exp)) return null;
  const phone = String(claims.ph || "").replace(/\D/g, "") || null;
  return { token, businessId, waId, phone, exp };
}

function isLive(handoff: WhatsappHandoff, businessId?: number | null): boolean {
  if (handoff.exp * 1000 <= Date.now()) return false;
  return !businessId || handoff.businessId === Number(businessId);
}

/** Saves `?wa=` from the current URL (if any) and removes it from the address bar. */
export function captureHandoffFromUrl(): WhatsappHandoff | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const token = url.searchParams.get(PARAM);
  if (!token) return null;
  url.searchParams.delete(PARAM);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  const handoff = decodeHandoff(token);
  if (!handoff || !isLive(handoff)) return null;
  try {
    window.localStorage.setItem(HANDOFF_STORAGE_KEY, token);
  } catch {
    // Private mode: the handoff still works for this page view via the return value.
  }
  return handoff;
}

/** The active handoff for this store, if the visit started from its WhatsApp chat. */
export function readHandoff(businessId?: number | null): WhatsappHandoff | null {
  if (typeof window === "undefined") return null;
  let token: string | null = null;
  try {
    token = window.localStorage.getItem(HANDOFF_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!token) return null;
  const handoff = decodeHandoff(token);
  if (!handoff || !isLive(handoff, businessId)) {
    clearHandoff();
    return null;
  }
  return handoff;
}

export function clearHandoff(): void {
  try {
    window.localStorage.removeItem(HANDOFF_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** `+919876543210` → `+91 98765 43210` for Indian numbers; `+<digits>` otherwise. */
export function formatWaNumber(digits: string): string {
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export function backToWhatsappUrl(handoff: WhatsappHandoff): string | null {
  return handoff.phone ? `https://wa.me/${handoff.phone}` : null;
}

/** National 10-digit form for the Indian phone fields; empty when the number isn't Indian. */
export function indianMobileFromWaId(waId: string): string {
  return waId.length === 12 && waId.startsWith("91") ? waId.slice(2) : "";
}
