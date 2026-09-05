import { apiOrigin } from "@/lib/api/origin";

export type GeoAddress = {
  lat: number;
  lng: number;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  societyName?: string;
  landmark?: string;
  houseNumber?: string;
  floor?: string;
  tower?: string;
  /** True when the user picked a search result — overwrite society/landmark. */
  replaceDetails?: boolean;
};

const API_ORIGIN = apiOrigin();
const SEARCH_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map<string, { at: number; hits: GeoAddress[] }>();

export type GeoSearchNear = {
  lat?: number | null
  lng?: number | null
  radiusKm?: number | null
}

function searchKey(q: string, near?: GeoSearchNear): string {
  const base = q.trim().toLowerCase()
  const lat = Number(near?.lat)
  const lng = Number(near?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return base
  const radius = Number(near?.radiusKm)
  const r = Number.isFinite(radius) ? Math.round(radius) : 80
  return `${base}@${lat.toFixed(2)},${lng.toFixed(2)},${r}`
}

function nearQuery(near?: GeoSearchNear): string {
  const lat = Number(near?.lat)
  const lng = Number(near?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  const params = [`lat=${encodeURIComponent(String(lat))}`, `lng=${encodeURIComponent(String(lng))}`]
  const radius = Number(near?.radiusKm)
  if (Number.isFinite(radius) && radius > 0) {
    params.push(`radiusKm=${encodeURIComponent(String(radius))}`)
  }
  return `&${params.join('&')}`
}

export async function searchPlaces(
  q: string,
  signal?: AbortSignal,
  near?: GeoSearchNear,
): Promise<GeoAddress[]> {
  const query = q.trim()
  if (query.length < 2) return []
  const key = searchKey(query, near)
  const cached = searchCache.get(key)
  if (cached && Date.now() - cached.at < SEARCH_TTL_MS) return cached.hits
  const data = await geoGet(
    `/api/v1/geo/search?q=${encodeURIComponent(query)}${nearQuery(near)}`,
    signal,
  )
  if (signal?.aborted) return []
  const hits = Array.isArray(data) ? (data as GeoAddress[]) : []
  if (hits.length) searchCache.set(key, { at: Date.now(), hits })
  return hits
}

function unwrap(res: unknown): unknown {
  if (res && typeof res === "object" && "data" in (res as object)) {
    return (res as { data: unknown }).data;
  }
  return res ?? null;
}

async function geoGet(path: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) return null;
  return unwrap(await res.json());
}

export function searchRadiusKm(deliveryRadiusKm?: number | null): number {
  const r = Number(deliveryRadiusKm);
  if (!Number.isFinite(r) || r <= 0) return 80;
  return Math.min(120, Math.max(80, r * 8));
}

export function nearFromCoords(
  lat?: number | null,
  lng?: number | null,
  deliveryRadiusKm?: number | null,
): GeoSearchNear | undefined {
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return undefined;
  if (Math.abs(a) > 90 || Math.abs(b) > 180) return undefined;
  return { lat: a, lng: b, radiusKm: searchRadiusKm(deliveryRadiusKm) };
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoAddress | null> {
  const data = await geoGet(
    `/api/v1/geo/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
  );
  if (!data || typeof data !== "object" || (data as GeoAddress).lat == null) return null;
  return data as GeoAddress;
}
