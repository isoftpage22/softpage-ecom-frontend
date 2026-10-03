"use client";

import { useEffect, useState } from "react";
import { fetchShippingQuote, type ServiceabilityQuote } from "@/lib/logisticsApi";
import { toCoord } from "@/lib/geo/coords";

function pin6(raw?: string | number | null) {
  return String(raw || "").replace(/\D/g, "").slice(0, 6);
}

export type QuoteLine = {
  quantity?: number;
  item?: {
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/** Summed weight and the largest side, matching the checkout quote. */
export function cartPackageMetrics(lines?: QuoteLine[] | null): {
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
} {
  let weightKg = 0;
  let lengthCm = 0;
  let widthCm = 0;
  let heightCm = 0;
  for (const line of lines || []) {
    const item = line.item;
    if (!item) continue;
    const qty = Number(line.quantity) || 1;
    const weight = Number(item.weight);
    if (Number.isFinite(weight) && weight > 0) weightKg += weight * qty;
    const length = Number(item.length);
    const width = Number(item.width);
    const height = Number(item.height);
    if (Number.isFinite(length) && length > 0) lengthCm = Math.max(lengthCm, length);
    if (Number.isFinite(width) && width > 0) widthCm = Math.max(widthCm, width);
    if (Number.isFinite(height) && height > 0) heightCm = Math.max(heightCm, height);
  }
  return {
    ...(weightKg > 0 ? { weightKg } : {}),
    ...(lengthCm > 0 ? { lengthCm } : {}),
    ...(widthCm > 0 ? { widthCm } : {}),
    ...(heightCm > 0 ? { heightCm } : {}),
  };
}

/** Live quote label: how soon the vehicle reaches the store. */
export function formatPickupEta(etaMinutes: number | null | undefined): string | null {
  if (etaMinutes == null || !Number.isFinite(Number(etaMinutes))) return null;
  const n = Math.round(Number(etaMinutes));
  if (n < 1) return null;
  return `Pickup in ${n} min`;
}

/** Short label for the address bar, e.g. `~25 min`. */
export function formatEtaMinutes(etaMinutes: number | null | undefined): string | null {
  if (etaMinutes == null || !Number.isFinite(Number(etaMinutes))) return null;
  const n = Math.round(Number(etaMinutes));
  if (n < 1) return null;
  if (n < 60) return `~${n} min`;
  return `~${Math.round(n / 60)} hr`;
}

/** Buyer-facing delivery charge from a live quote. Null when unknown. */
export function deliveryFeeFromQuote(quote: ServiceabilityQuote | null): number | null {
  if (!quote?.serviceable) return null;
  if (quote.freeShippingApplied) return 0;
  const amount = quote.shippingCharge ?? quote.winner?.amount;
  if (amount == null || !Number.isFinite(Number(amount))) return null;
  return Math.max(0, Math.round(Number(amount) * 100) / 100);
}

export function useDeliveryQuote(opts: {
  store?: string | null;
  pincode?: string | number | null;
  lat?: unknown;
  lng?: unknown;
  orderValue?: number;
  lines?: QuoteLine[] | null;
  enabled?: boolean;
}): { quote: ServiceabilityQuote | null; loading: boolean } {
  const [quote, setQuote] = useState<ServiceabilityQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const store = (opts.store || "").trim();
  const pin = pin6(opts.pincode);
  const lat = toCoord(opts.lat);
  const lng = toCoord(opts.lng);
  const hasPin = pin.length === 6;
  const hasCoords = lat != null && lng != null;
  const enabled = opts.enabled !== false;
  const orderValue = Number(opts.orderValue) || 0;
  const pkg = cartPackageMetrics(opts.lines);
  const pkgKey = `${pkg.weightKg ?? ""}|${pkg.lengthCm ?? ""}|${pkg.widthCm ?? ""}|${pkg.heightCm ?? ""}`;

  useEffect(() => {
    if (!enabled || !store || (!hasPin && !hasCoords)) {
      setQuote(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchShippingQuote({
          store,
          pincode: hasPin ? pin : undefined,
          lat,
          lng,
          orderValue,
          weightKg: pkg.weightKg,
          lengthCm: pkg.lengthCm,
          widthCm: pkg.widthCm,
          heightCm: pkg.heightCm,
        });
        if (!cancelled) setQuote(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, store, pin, hasPin, hasCoords, lat, lng, orderValue, pkgKey]);

  return { quote, loading };
}
