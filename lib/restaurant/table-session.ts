"use client";

const STORAGE_KEY = "restaurantTableSession";

export type RestaurantOrderType = "dine_in" | "takeaway";
export type RestaurantChannel = "qr_table" | "website";

/** Persisted context for QR table or takeaway ordering flows. */
export interface TableSession {
  tableId?: string;
  qrToken?: string;
  orderType: RestaurantOrderType;
  channel: RestaurantChannel;
  businessId: number;
  businessAppId?: number | null;
  tableNumber?: string;
  tableName?: string;
  guestCount?: number;
  section?: string;
  // Generic QR App context (superset of the legacy restaurant table session).
  qrLinkId?: string;
  resourceId?: string;
  resourceType?: string;
  label?: string;
  // Cover-charge / deposit auto-matched at scan time.
  matchedReservationId?: string;
  depositAmount?: number;
  // Restaurant dine-in payment timing: pay now vs settle at table close.
  paymentTiming?: "upfront" | "on_close";
}

export function getTableSession(): TableSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TableSession;
    if (!parsed?.businessId || !parsed?.orderType || !parsed?.channel) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setTableSession(session: TableSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearTableSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isDineInSession(session: TableSession | null): session is TableSession & {
  orderType: "dine_in";
} {
  // A QR scan makes this a dine-in table order regardless of whether the
  // underlying floor tableId has been resolved yet. Keying off channel /
  // orderType (not tableId) ensures table guests never fall into the
  // e-commerce address + shipping flow.
  return (
    !!session &&
    (session.orderType === "dine_in" || session.channel === "qr_table")
  );
}

/** Human-readable label for cart / checkout banners. */
export function tableSessionLabel(session: TableSession | null): string | null {
  if (!session) return null;
  if (session.orderType === "dine_in") {
    const label = session.tableName || (session.tableNumber ? `Table ${session.tableNumber}` : "your table");
    return `Dine-in · ${label}`;
  }
  return "Takeaway";
}

/**
 * Encode table / order context into checkout notes until the GraphQL checkout
 * input supports tableId, channel, and orderType directly.
 */
export function buildCheckoutNotes(
  session: TableSession | null,
  customerNote?: string,
): string | undefined {
  const note = customerNote?.trim();
  if (!session) return note || undefined;
  const payload = {
    orderType: session.orderType,
    channel: session.channel,
    tableId: session.tableId ?? null,
    qrToken: session.qrToken ?? null,
    tableNumber: session.tableNumber ?? null,
    tableName: session.tableName ?? null,
    guestCount: session.guestCount ?? null,
    resourceId: session.resourceId ?? null,
    reservationId: session.matchedReservationId ?? null,
  };
  // Admin OrderDetailDrawer parses `RESTAURANT_ORDER:{json}` and shows any
  // trailing free text as the guest's note.
  const marker = `RESTAURANT_ORDER:${JSON.stringify(payload)}`;
  return note ? `${marker} ${note}` : marker;
}
