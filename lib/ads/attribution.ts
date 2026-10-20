/** Ad click IDs and UTM tags, kept in a first-party cookie for 90 days and sent with checkout. Same format as the storefront. */
const COOKIE = "sp_ads_attr";
const DAYS = 90;

export interface AdAttribution {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
}

const KEYS: (keyof AdAttribution)[] = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "fbc",
  "fbp",
];

export function captureAttributionFromUrl(search: string): void {
  if (typeof document === "undefined") return;
  const params = new URLSearchParams(search);
  const incoming: AdAttribution = {};
  for (const key of KEYS) {
    const value = params.get(key);
    if (value) incoming[key] = value.slice(0, 200);
  }
  if (incoming.fbclid && !incoming.fbc) {
    incoming.fbc = `fb.1.${Date.now()}.${incoming.fbclid}`;
  }
  const fbp = document.cookie.split("; ").find((row) => row.startsWith("_fbp="))?.slice(5);
  if (fbp) incoming.fbp = fbp;
  if (!Object.keys(incoming).length) return;
  const merged = { ...readAttribution(), ...incoming };
  const expires = new Date(Date.now() + DAYS * 86400000).toUTCString();
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(merged))}; expires=${expires}; path=/; SameSite=Lax`;
}

export function readAttribution(): AdAttribution {
  if (typeof document === "undefined") return {};
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as AdAttribution;
    const out: AdAttribution = {};
    for (const key of KEYS) {
      if (typeof parsed[key] === "string") out[key] = parsed[key];
    }
    return out;
  } catch {
    return {};
  }
}

export function attributionJson(): string | undefined {
  const value = readAttribution();
  return Object.keys(value).length ? JSON.stringify(value) : undefined;
}
