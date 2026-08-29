const FAKE_COORDS = new Set(["2302", "4302"]);

export function toCoord(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (FAKE_COORDS.has(String(value).trim())) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function isValidCoordPair(lat: unknown, lng: unknown): boolean {
  const a = toCoord(lat);
  const b = toCoord(lng);
  if (a == null || b == null) return false;
  if (a === 0 && b === 0) return false;
  if (Math.abs(a) > 90 || Math.abs(b) > 180) return false;
  return true;
}
