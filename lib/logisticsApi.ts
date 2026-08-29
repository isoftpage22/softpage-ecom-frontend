export type ServiceabilityQuote = {
  serviceable: boolean;
  reason: "ok" | "out_of_zone" | "not_serviceable" | "in_zone_unchecked";
  etaMinutes: number | null;
  codAllowed: boolean;
  class: string | null;
  inZone?: boolean;
  distanceKm?: number | null;
  radiusKm?: number | null;
  centerLat?: number | null;
  centerLng?: number | null;
  winner: { provider: string; amount: number | null; etaMinutes: number | null } | null;
  shippingCharge?: number | null;
  currency?: string;
  rateLabel?: string | null;
  /** True when a merchant free-shipping threshold zeroed the buyer charge. */
  freeShippingApplied?: boolean;
};

export type DeliveryAreaZone = {
  type: "pincode" | "radius" | "polygon";
  centerLat: number | null;
  centerLng: number | null;
  radiusKm: number | null;
  pincodes?: string[] | null;
};

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function unwrap<T>(body: unknown): T | null {
  if (!body || typeof body !== "object") return null;
  const rec = body as { success?: boolean; data?: T };
  if (rec.success === false) return null;
  return (rec.data ?? body) as T;
}

export async function fetchShippingQuote(opts: {
  store: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  isCod?: boolean;
  orderValue?: number;
  weightKg?: number;
  country?: string;
}): Promise<ServiceabilityQuote | null> {
  const store = opts.store.trim();
  if (!store) return null;
  const res = await fetch(
    `${API_ORIGIN}/api/v1/public/store/${encodeURIComponent(store)}/shipping-quote`,
    {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: opts.pincode || undefined,
        lat: opts.lat,
        lng: opts.lng,
        isCod: Boolean(opts.isCod),
        orderValue: opts.orderValue,
        weightKg: opts.weightKg,
        country: opts.country,
      }),
    },
  );
  if (!res.ok) return null;
  return unwrap<ServiceabilityQuote>(await res.json());
}

export async function fetchDeliveryArea(store: string): Promise<DeliveryAreaZone[]> {
  const slug = store.trim();
  if (!slug) return [];
  const res = await fetch(
    `${API_ORIGIN}/api/v1/public/store/${encodeURIComponent(slug)}/delivery-area`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return [];
  const data = unwrap<{ zones?: DeliveryAreaZone[] }>(await res.json());
  if (Array.isArray(data)) return data as DeliveryAreaZone[];
  return Array.isArray(data?.zones) ? data.zones : [];
}

export async function checkServiceability(opts: {
  store: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}): Promise<ServiceabilityQuote | null> {
  const store = opts.store.trim();
  if (!store) return null;
  const params = new URLSearchParams();
  if (opts.pincode) params.set("pincode", opts.pincode);
  if (opts.lat != null) params.set("lat", String(opts.lat));
  if (opts.lng != null) params.set("lng", String(opts.lng));
  const res = await fetch(
    `${API_ORIGIN}/api/v1/public/store/${encodeURIComponent(store)}/serviceability?${params.toString()}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;
  return unwrap<ServiceabilityQuote>(await res.json());
}
