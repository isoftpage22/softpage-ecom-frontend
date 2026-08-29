/** Backend origin with no trailing slash or `/api` suffix. */
export function apiOrigin(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === "production"
    ? "https://api.softpage.in"
    : "http://localhost:3000";
}
