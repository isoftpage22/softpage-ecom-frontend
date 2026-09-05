import { loadGoogleMaps } from "@/lib/geo/loadGoogleMaps";
import type { GeoAddress, GeoSearchNear } from "@/lib/geo/geoApi";
import { extractIndiaDeliveryParts } from "@/lib/geo/indiaDeliveryParts";

export type PlacePrediction = {
  placeId: string;
  label: string;
  secondary?: string;
  address?: GeoAddress;
};

type Comp = { long_name: string; types: string[] };

function normalizeComps(result: any): Comp[] {
  const raw = result?.address_components || result?.addressComponents || [];
  if (!Array.isArray(raw)) return [];
  return raw.map((c: any) => ({
    long_name: String(c.long_name || c.longText || c.long_text || "").trim(),
    types: Array.isArray(c.types) ? c.types : [],
  }));
}

function resultScore(result: { types?: string[] } | undefined): number {
  const types = result?.types || [];
  if (types.includes("street_address")) return 100;
  if (types.includes("premise")) return 95;
  if (types.includes("subpremise")) return 90;
  if (types.includes("establishment")) return 85;
  if (types.includes("point_of_interest")) return 80;
  if (types.includes("neighborhood")) return 55;
  if (types.includes("route")) return 40;
  if (types.includes("plus_code")) return 8;
  return 20;
}

export function pickBestGeocodeResult<T extends { types?: string[] }>(
  results: T[] | undefined,
): T | undefined {
  if (!results?.length) return undefined;
  return [...results].sort((a, b) => resultScore(b) - resultScore(a))[0];
}

export function parseGoogleGeocode(
  result: any,
  lat: number,
  lng: number,
  placeName?: string,
): GeoAddress {
  const comps = normalizeComps(result);
  const get = (...types: string[]) =>
    comps.find((c) => types.every((t) => c.types.includes(t)))?.long_name ||
    comps.find((c) => types.some((t) => c.types.includes(t)))?.long_name ||
    "";

  const route = get("route");
  const sublocalities = comps
    .filter((c) =>
      c.types.some(
        (t) => t === "neighborhood" || t === "sublocality" || t.startsWith("sublocality_level"),
      ),
    )
    .map((c) => c.long_name)
    .filter(Boolean);
  const neighborhood =
    get("neighborhood") ||
    get("sublocality_level_1") ||
    get("sublocality_level_2") ||
    get("sublocality");
  const city =
    get("locality") || get("administrative_area_level_2") || get("postal_town");
  const state = get("administrative_area_level_1");
  const pincode = get("postal_code").replace(/\D/g, "").slice(0, 6);
  const types: string[] = Array.isArray(result?.types) ? result.types : [];
  const name = String(
    placeName || result?.name || result?.displayName || "",
  ).trim();
  const parts = extractIndiaDeliveryParts({
    formatted: String(result?.formatted_address || result?.formattedAddress || ""),
    name,
    streetNumber: get("street_number"),
    subpremise: get("subpremise"),
    premise: get("premise"),
    building: get("premise"),
    road: route,
    neighborhood,
    sublocalities,
    landmarkName: get("landmark"),
    sublocalityLevel1:
      comps.find(
        (c) =>
          c.types.includes("sublocality_level_1") &&
          c.types.includes("sublocality") &&
          c.types.includes("political"),
      )?.long_name ||
      comps.find((c) => c.types.includes("sublocality_level_1"))?.long_name ||
      "",
    city,
    state,
    types,
  });
  const formatted = String(result?.formatted_address || result?.formattedAddress || "").trim();
  const line1 = parts.area || formatted || name || "";

  return {
    lat,
    lng,
    line1,
    city,
    state,
    pincode,
    country: get("country") || "India",
    houseNumber: parts.houseNumber,
    floor: parts.floor || get("floor"),
    tower: parts.tower,
    societyName: parts.societyName,
    landmark: parts.landmark,
  };
}

function mergeGeocodeResults(results: any[] | undefined, best?: any): any {
  const comps: Comp[] = [];
  const seen = new Set<string>();
  const addFrom = (row: any) => {
    for (const c of normalizeComps(row)) {
      const key = `${c.long_name}|${[...c.types].sort().join(",")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      comps.push(c);
    }
  };
  if (best) addFrom(best);
  for (const row of results || []) addFrom(row);
  return {
    ...best,
    address_components: comps,
    types: best?.types,
    formatted_address: best?.formatted_address || best?.formattedAddress,
    name: best?.name,
  };
}

let sessionToken: any = null;

function placesNs(): any {
  return window.google?.maps?.places || null;
}

function getSessionToken(): any {
  const Places = placesNs();
  if (!Places?.AutocompleteSessionToken) return null;
  if (!sessionToken) sessionToken = new Places.AutocompleteSessionToken();
  return sessionToken;
}

function resetSession(): void {
  sessionToken = null;
}

async function ensurePlaces(): Promise<any> {
  await loadGoogleMaps();
  const maps = window.google?.maps;
  if (!maps) return null;
  if (!maps.places && typeof maps.importLibrary === "function") {
    try {
      await maps.importLibrary("places");
    } catch {
      return maps.places || null;
    }
  }
  return maps.places || null;
}

function biasCircle(near?: GeoSearchNear): { center: { lat: number; lng: number }; radius: number } | null {
  const lat = Number(near?.lat);
  const lng = Number(near?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const km = Number(near?.radiusKm);
  const radius = Math.min(50000, Math.max(4000, (Number.isFinite(km) && km > 0 ? km : 8) * 1000));
  return { center: { lat, lng }, radius };
}

async function searchNewAutocomplete(q: string, near?: GeoSearchNear): Promise<PlacePrediction[]> {
  const Places = placesNs();
  const fetchFn = Places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions;
  if (typeof fetchFn !== "function") return [];
  const req: Record<string, unknown> = {
    input: q,
    includedRegionCodes: ["in"],
  };
  const token = getSessionToken();
  if (token) req.sessionToken = token;
  const bias = biasCircle(near);
  if (bias) req.locationBias = bias;
  const res = await fetchFn(req);
  const suggestions = res?.suggestions || [];
  return suggestions
    .map((row: any) => {
      const pred = row?.placePrediction;
      const text = pred?.mainText?.text || pred?.text?.text || pred?.text || "";
      const secondary = pred?.secondaryText?.text || "";
      const placeId = pred?.placeId || pred?.place_id || "";
      return {
        placeId: String(placeId),
        label: String(text).trim(),
        secondary: String(secondary).trim() || undefined,
      };
    })
    .filter((row: PlacePrediction) => row.placeId && row.label);
}

async function searchClassicAutocomplete(q: string, near?: GeoSearchNear): Promise<PlacePrediction[]> {
  const Places = placesNs();
  if (!Places?.AutocompleteService) return [];
  const svc = new Places.AutocompleteService();
  const token = getSessionToken();
  const bias = biasCircle(near);
  const origin =
    bias && window.google?.maps?.LatLng
      ? new window.google.maps.LatLng(bias.center.lat, bias.center.lng)
      : null;

  const predict = (types?: string[]): Promise<PlacePrediction[]> =>
    new Promise((resolve) => {
      const req: Record<string, unknown> = {
        input: q,
        componentRestrictions: { country: "in" },
      };
      if (types?.length) req.types = types;
      if (token) req.sessionToken = token;
      if (origin) {
        req.location = origin;
        req.radius = bias?.radius;
        req.origin = origin;
      }
      const maybe = svc.getPlacePredictions(req, (results: any[] | null, status: string) => {
        if (status && status !== "OK" && status !== "ZERO_RESULTS") {
          resolve([]);
          return;
        }
        resolve(mapPredictions(results || []));
      });
      if (maybe && typeof maybe.then === "function") {
        maybe
          .then((r: any) => resolve(mapPredictions(r?.predictions || r || [])))
          .catch(() => resolve([]));
      }
    });

  const mapPredictions = (preds: any[]): PlacePrediction[] =>
    preds
      .map((p) => ({
        placeId: String(p.place_id || p.placeId || ""),
        label: String(p.structured_formatting?.main_text || p.description || "").trim(),
        secondary: String(p.structured_formatting?.secondary_text || "").trim() || undefined,
      }))
      .filter((row) => row.placeId && row.label);

  const [places, geocode] = await Promise.all([predict(["establishment"]), predict(["geocode"])]);
  const seen = new Set<string>();
  const merged: PlacePrediction[] = [];
  for (const row of [...places, ...geocode]) {
    if (seen.has(row.placeId)) continue;
    seen.add(row.placeId);
    merged.push(row);
    if (merged.length >= 8) break;
  }
  if (merged.length) return merged;
  return predict();
}

export async function searchGooglePlaces(
  q: string,
  near?: GeoSearchNear,
): Promise<PlacePrediction[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const places = await ensurePlaces();
  if (!places) return [];
  // Classic AutocompleteService uses the Maps JavaScript / Places (legacy)
  // library. Places API (New) AutocompletePlaces is a separate product and is
  // often blocked with API_KEY_SERVICE_BLOCKED on keys that already work for maps.
  try {
    const classic = await searchClassicAutocomplete(query, near);
    if (classic.length) return classic.slice(0, 8);
  } catch {
    /* new API fallback */
  }
  try {
    return (await searchNewAutocomplete(query, near)).slice(0, 8);
  } catch {
    return [];
  }
}

function toLatLng(loc: any): { lat: number; lng: number } | null {
  if (!loc) return null;
  const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
  const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;
  return { lat: Number(lat), lng: Number(lng) };
}

async function resolveNewPlace(placeId: string): Promise<GeoAddress | null> {
  const Places = placesNs();
  if (!Places?.Place) return null;
  const place = new Places.Place({ id: placeId });
  await place.fetchFields({
    fields: ["location", "addressComponents", "displayName", "formattedAddress", "types"],
  });
  const coords = toLatLng(place.location);
  if (!coords) return null;
  resetSession();
  return parseGoogleGeocode(
    {
      formatted_address: place.formattedAddress,
      addressComponents: place.addressComponents,
      name: place.displayName,
      types: place.types,
    },
    coords.lat,
    coords.lng,
    place.displayName,
  );
}

async function resolveClassicPlace(placeId: string): Promise<GeoAddress | null> {
  const Places = placesNs();
  if (!Places?.PlacesService) return null;
  const attr = document.createElement("div");
  const svc = new Places.PlacesService(attr);
  const token = getSessionToken();
  const details: any = await new Promise((resolve) => {
    svc.getDetails(
      {
        placeId,
        fields: ["geometry", "address_components", "name", "formatted_address", "types"],
        ...(token ? { sessionToken: token } : {}),
      },
      (place: any, status: string) => {
        if (status !== "OK" || !place) {
          resolve(null);
          return;
        }
        resolve(place);
      },
    );
  });
  resetSession();
  const coords = toLatLng(details?.geometry?.location);
  if (!coords) return null;
  return parseGoogleGeocode(details, coords.lat, coords.lng, details.name);
}

export async function resolveGooglePlace(placeId: string): Promise<GeoAddress | null> {
  if (!placeId) return null;
  const places = await ensurePlaces();
  if (!places) return null;
  try {
    const next = await resolveClassicPlace(placeId);
    if (next) return { ...next, replaceDetails: true };
  } catch {
    /* new API fallback */
  }
  try {
    const next = await resolveNewPlace(placeId);
    return next ? { ...next, replaceDetails: true } : null;
  } catch {
    return null;
  }
}

export async function reverseGoogleGeocode(
  lat: number,
  lng: number,
): Promise<GeoAddress | null> {
  await loadGoogleMaps();
  const Geocoder = window.google?.maps?.Geocoder;
  if (!Geocoder) return null;
  try {
    const coder = new Geocoder();
    const res = await coder.geocode({ location: { lat, lng } });
    const best = pickBestGeocodeResult(res?.results);
    const parsed = parseGoogleGeocode(mergeGeocodeResults(res?.results, best), lat, lng, best?.name);
    if (!parsed.line1 && !parsed.city && !parsed.pincode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAccuratePosition(): Promise<{ lat: number; lng: number }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Location is not available in this browser");
  }
  const opts: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  };
  const once = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });

  const first = await once();
  const pack = (pos: GeolocationPosition) => ({
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
  });
  let best = pack(first);
  if (best.accuracy <= 80) return best;

  return await new Promise((resolve) => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = pack(pos);
        if (next.accuracy < best.accuracy) best = next;
        if (best.accuracy <= 40) {
          navigator.geolocation.clearWatch(watchId);
          resolve(best);
        }
      },
      () => resolve(best),
      opts,
    );
    window.setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      resolve(best);
    }, 2500);
  });
}
