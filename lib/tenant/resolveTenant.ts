import { headers } from "next/headers";
import { cache } from "react";
import type { TenantInfo } from "./TenantContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchTenant(url: string): Promise<TenantInfo | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as TenantInfo) ?? null;
  } catch {
    return null;
  }
}

/**
 * Server-only tenant resolver. Production hosts such as
 * `asian-box-restaurant.softpage.in` map via `GET /api/v1/public/store/by-host`.
 * Localhost / preview falls back to `NEXT_PUBLIC_STORE_SUBDOMAIN` → `by-subdomain`
 * so branding still SSR-loads without a real tenant host.
 */
export const resolveTenant = cache(async (): Promise<TenantInfo | null> => {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") || headersList.get("host") || "";

  if (host) {
    const byHost = await fetchTenant(
      `${API_BASE_URL}/api/v1/public/store/by-host?host=${encodeURIComponent(host)}`,
    );
    if (byHost) return byHost;
  }

  const subdomain = (process.env.NEXT_PUBLIC_STORE_SUBDOMAIN || "").trim();
  if (!subdomain) return null;
  return fetchTenant(
    `${API_BASE_URL}/api/v1/public/store/by-subdomain/${encodeURIComponent(subdomain)}`,
  );
});
