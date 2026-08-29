"use client";

import { useEffect, useState } from "react";
import { fetchShippingQuote, type ServiceabilityQuote } from "@/lib/logisticsApi";
import { toCoord } from "@/lib/geo/coords";

function pin6(raw?: string | number | null) {
  return String(raw || "").replace(/\D/g, "").slice(0, 6);
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
  }, [enabled, store, pin, hasPin, hasCoords, lat, lng, orderValue]);

  return { quote, loading };
}
