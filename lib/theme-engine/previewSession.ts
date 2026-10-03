const KEY = "sp.preview";

/** Remember a theme-studio preview so later cart and checkout routes stay in preview. */
export function syncThemePreview(): boolean {
  if (typeof window === "undefined") return false;
  const inUrl = new URLSearchParams(window.location.search).has("sp_preview");
  try {
    // sessionStorage can throw inside a cross-site iframe with storage blocked.
    if (inUrl) sessionStorage.setItem(KEY, "1");
    else if (window.location.pathname === "/") sessionStorage.removeItem(KEY);
  } catch {
    // fall through: the URL flag alone is enough for this page
  }
  return isThemePreview();
}

export function isThemePreview(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).has("sp_preview")) return true;
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
