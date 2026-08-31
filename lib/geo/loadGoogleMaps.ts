const GOOGLE_MAPS_SRC = "https://maps.googleapis.com/maps/api/js";

let loader: Promise<any> | null = null;

declare global {
  interface Window {
    __softpageMapsReady?: () => void;
  }
}

export function getGoogleMapsApiKey(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
}

export function isGoogleMapsEnabled(): boolean {
  const flag = (process.env.NEXT_PUBLIC_USE_GOOGLE_MAPS || "").trim().toLowerCase();
  return (flag === "true" || flag === "1") && Boolean(getGoogleMapsApiKey());
}

/**
 * `loading=async` only bootstraps `importLibrary`. `google.maps.Map` is missing
 * until that call finishes — polling for Map was racing the loader and falling
 * back to Leaflet.
 */
export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!isGoogleMapsEnabled()) return Promise.resolve(null);
  const key = getGoogleMapsApiKey();
  if (!key) return Promise.resolve(null);
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (maps?: any) => {
      if (settled) return;
      settled = true;
      resolve(maps ?? window.google?.maps ?? null);
    };
    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      loader = null;
      reject(err);
    };

    const ready = async () => {
      try {
        const mapsNs = window.google?.maps;
        if (!mapsNs) {
          fail(new Error("Failed to load Google Maps"));
          return;
        }
        if (typeof mapsNs.importLibrary === "function") {
          await mapsNs.importLibrary("maps");
        }
        if (!window.google?.maps?.Map) {
          fail(new Error("Failed to load Google Maps"));
          return;
        }
        finish(window.google.maps);
      } catch (err) {
        fail(err instanceof Error ? err : new Error("Failed to load Google Maps"));
      }
    };

    window.__softpageMapsReady = () => {
      void ready();
    };

    const existing = document.querySelector(
      `script[data-softpage-maps="1"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.google?.maps) {
        void ready();
      }
      existing.addEventListener(
        "error",
        () => fail(new Error("Failed to load Google Maps")),
        { once: true },
      );
      window.setTimeout(() => {
        if (!settled) fail(new Error("Failed to load Google Maps"));
      }, 20000);
      return;
    }

    const script = document.createElement("script");
    script.dataset.softpageMaps = "1";
    script.async = true;
    script.src = `${GOOGLE_MAPS_SRC}?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__softpageMapsReady&region=IN&language=en`;
    script.onerror = () => fail(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
    window.setTimeout(() => {
      if (!settled) fail(new Error("Failed to load Google Maps"));
    }, 20000);
  });

  return loader;
}

type AddressComponent = { long_name: string; types: string[] };

export function parseGoogleGeocode(
  result: { formatted_address?: string; address_components?: AddressComponent[] } | undefined,
  lat: number,
  lng: number,
): {
  lat: number;
  lng: number;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
} {
  const comps = result?.address_components || [];
  const get = (...types: string[]) =>
    comps.find((c) => types.every((t) => c.types.includes(t)))?.long_name ||
    comps.find((c) => types.some((t) => c.types.includes(t)))?.long_name ||
    "";

  const streetNumber = get("street_number");
  const route = get("route");
  const premise = get("premise") || get("subpremise");
  const line1 =
    [streetNumber, route].filter(Boolean).join(" ") ||
    premise ||
    get("neighborhood") ||
    get("sublocality_level_1") ||
    get("sublocality") ||
    result?.formatted_address?.split(",")[0] ||
    "";

  return {
    lat,
    lng,
    line1,
    city: get("locality") || get("administrative_area_level_2") || "",
    state: get("administrative_area_level_1") || "",
    pincode: get("postal_code") || "",
    country: get("country") || "India",
  };
}
