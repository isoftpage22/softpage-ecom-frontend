export type GeoAddress = {
  lat: number;
  lng: number;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SEARCH_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map<string, { at: number; hits: GeoAddress[] }>();

function searchKey(q: string): string {
  return q.trim().toLowerCase();
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

export async function reverseGeocode(lat: number, lng: number): Promise<GeoAddress | null> {
  const data = await geoGet(
    `/api/v1/geo/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
  );
  if (!data || typeof data !== "object" || (data as GeoAddress).lat == null) return null;
  return data as GeoAddress;
}

export async function searchPlaces(
  q: string,
  signal?: AbortSignal,
): Promise<GeoAddress[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const key = searchKey(query);
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.at < SEARCH_TTL_MS) return cached.hits;
  const data = await geoGet(
    `/api/v1/geo/search?q=${encodeURIComponent(query)}`,
    signal,
  );
  if (signal?.aborted) return [];
  const hits = Array.isArray(data) ? (data as GeoAddress[]) : [];
  if (hits.length) searchCache.set(key, { at: Date.now(), hits });
  return hits;
}
