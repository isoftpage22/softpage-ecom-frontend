const PREFIX = "menu:listing:";
const TTL_MS = 30 * 60 * 1000;

let live = { searchQuery: "", vegOnly: false };

function currentPathname(pathname) {
  if (pathname) return pathname;
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

export function listingRestoreKey(pathname) {
  return PREFIX + currentPathname(pathname);
}

export function isMenuListingPath(pathname) {
  const path = currentPathname(pathname);
  if (path === "/" || path === "") return true;
  if (path.startsWith("/qr/")) return true;
  if (path.startsWith("/home/")) return true;
  return false;
}

export function setListingRestoreLive(partial) {
  live = { ...live, ...partial };
}

export function peekListingRestore(pathname) {
  if (typeof window === "undefined") return null;
  try {
    const key = listingRestoreKey(pathname);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const snap = JSON.parse(raw);
    if (!snap || typeof snap !== "object") return null;
    if (Date.now() - Number(snap.ts || 0) > TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return {
      y: Number(snap.y) || 0,
      searchQuery: String(snap.searchQuery || ""),
      vegOnly: !!snap.vegOnly,
      ts: Number(snap.ts) || 0,
    };
  } catch {
    return null;
  }
}

export function consumeListingRestore(pathname) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(listingRestoreKey(pathname));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearListingRestore(pathname) {
  consumeListingRestore(pathname);
}

export function saveListingRestore(pathname) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.history?.scrollRestoration === "string") {
      window.history.scrollRestoration = "manual";
    }
    const payload = {
      y: window.scrollY || window.pageYOffset || 0,
      searchQuery: live.searchQuery || "",
      vegOnly: !!live.vegOnly,
      ts: Date.now(),
    };
    sessionStorage.setItem(listingRestoreKey(pathname), JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}
