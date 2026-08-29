import { reverseGeocode, type GeoAddress } from "@/lib/geo/geoApi";
import { parseGoogleGeocode } from "@/lib/geo/loadGoogleMaps";

const PRECISION = 4;
const STORAGE_KEY = "sp-revgeo-v1";
const MAX_ENTRIES = 80;
const TTL_MS = 30 * 60 * 1000;

type CacheEntry = { addr: GeoAddress; at: number };

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<GeoAddress | null>>();
let geocoder: google.maps.Geocoder | null = null;
let sessionLoaded = false;

export function coordCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(PRECISION)},${lng.toFixed(PRECISION)}`;
}

function loadSession(): void {
  if (sessionLoaded || typeof window === "undefined") return;
  sessionLoaded = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    const now = Date.now();
    for (const [key, entry] of Object.entries(parsed || {})) {
      if (entry?.addr && now - Number(entry.at || 0) < TTL_MS) {
        memory.set(key, entry);
      }
    }
  } catch {
    /* private mode / quota */
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    const dump: Record<string, CacheEntry> = {};
    for (const [key, entry] of memory) dump[key] = entry;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dump));
  } catch {
    /* ignore */
  }
}

function remember(key: string, addr: GeoAddress): void {
  if (memory.size >= MAX_ENTRIES) {
    const first = memory.keys().next().value;
    if (first) memory.delete(first);
  }
  memory.set(key, { addr, at: Date.now() });
  persist();
}

export function lookupReverseGeocode(lat: number, lng: number): GeoAddress | null {
  loadSession();
  const entry = memory.get(coordCacheKey(lat, lng));
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    memory.delete(coordCacheKey(lat, lng));
    return null;
  }
  return entry.addr;
}

function getGeocoder(): google.maps.Geocoder | null {
  if (typeof window === "undefined" || !window.google?.maps) return null;
  if (!geocoder) geocoder = new window.google.maps.Geocoder();
  return geocoder;
}

async function googleReverse(lat: number, lng: number): Promise<GeoAddress | null> {
  const coder = getGeocoder();
  if (!coder) return null;
  try {
    const res = await coder.geocode({ location: { lat, lng } });
    const parsed = parseGoogleGeocode(res.results?.[0], lat, lng);
    if (!parsed.line1 && !parsed.city && !parsed.pincode) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Reverse-geocode with in-memory + sessionStorage cache and in-flight dedupe. */
export function reverseGeocodeCached(lat: number, lng: number): Promise<GeoAddress | null> {
  loadSession();
  const key = coordCacheKey(lat, lng);
  const cached = lookupReverseGeocode(lat, lng);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = (async () => {
    const fromGoogle = await googleReverse(lat, lng);
    if (fromGoogle) {
      remember(key, fromGoogle);
      return fromGoogle;
    }
    const fromNest = await reverseGeocode(lat, lng);
    if (fromNest) remember(key, fromNest);
    return fromNest;
  })();

  inflight.set(key, request);
  return request.finally(() => {
    inflight.delete(key);
  });
}
