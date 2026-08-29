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

    window.__softpageMapsReady = () => finish(window.google?.maps);

    const waitForMaps = (script?: HTMLScriptElement | null) => {
      if (window.google?.maps?.Map) {
        finish(window.google.maps);
        return;
      }
      let ticks = 0;
      const timer = window.setInterval(() => {
        ticks += 1;
        if (window.google?.maps?.Map) {
          window.clearInterval(timer);
          finish(window.google.maps);
        } else if (ticks >= 50) {
          window.clearInterval(timer);
          fail(new Error("Failed to load Google Maps"));
        }
      }, 100);
      script?.addEventListener("error", () => {
        window.clearInterval(timer);
        fail(new Error("Failed to load Google Maps"));
      }, { once: true });
    };

    const existing = document.querySelector(`script[data-softpage-maps="1"]`) as HTMLScriptElement | null;
    if (existing) {
      waitForMaps(existing);
      return;
    }

    const script = document.createElement("script");
    script.dataset.softpageMaps = "1";
    script.async = true;
    // Maps JS only (no Places library). Search uses the Nest geo API so we
    // avoid Autocomplete SKUs; reverse geocode is cached separately.
    script.src = `${GOOGLE_MAPS_SRC}?key=${encodeURIComponent(key)}&v=quarterly&loading=async&callback=__softpageMapsReady&region=IN&language=en`;
    script.onerror = () => fail(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
    waitForMaps(script);
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
