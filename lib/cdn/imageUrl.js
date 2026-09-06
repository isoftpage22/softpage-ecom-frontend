const GCS_HOST = "storage.googleapis.com";
const GCS_BUCKET_PREFIX = "/softpage_bucket/";

export function isLocalStoreHost() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }
  return process.env.NODE_ENV === "development";
}

export function isAllowedGcsUrl(raw) {
  if (!raw || typeof raw !== "string") return false;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    if (parsed.hostname !== GCS_HOST) return false;
    if (!parsed.pathname.startsWith(GCS_BUCKET_PREFIX)) return false;
    if (parsed.pathname.includes("..")) return false;
    return true;
  } catch {
    return false;
  }
}

/** Same-origin CDN proxy on store hosts; leave GCS URLs on localhost. */
export function toCdnImageUrl(src) {
  if (!src || typeof src !== "string") return src || "";
  if (src.startsWith("/cdn-img?")) return src;
  if (isLocalStoreHost()) return src;
  if (!isAllowedGcsUrl(src)) return src;
  return `/cdn-img?u=${encodeURIComponent(src)}`;
}
