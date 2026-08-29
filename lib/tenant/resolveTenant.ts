import { headers } from "next/headers";
import { cache } from "react";
import type { TenantInfo } from "./TenantContext";
import { apiOrigin } from "@/lib/api/origin";

const API_BASE_URL = apiOrigin();

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

/** Vercel / workers.dev hosts are not tenant stores — skip by-host for these. */
const PLATFORM_HOST = /(^|\.)vercel\.app$|(^|\.)workers\.dev$/i;

/**
 * Public restaurant host. Cloudflare must send `x-softpage-host` because Vercel
 * overwrites `x-forwarded-host` / `host` with `*.vercel.app` when the Worker
 * rewrites Host so Vercel will accept the request.
 */
function requestPublicHost(headersList: Headers): string {
  const candidates = [
    headersList.get("x-softpage-host"),
    headersList.get("x-original-host"),
    headersList.get("x-forwarded-host"),
    headersList.get("host"),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const host = raw.split(",")[0].trim().split(":")[0].toLowerCase();
    if (!host || PLATFORM_HOST.test(host)) continue;
    return host;
  }
  return "";
}

/**
 * Server-only tenant resolver. Production hosts such as
 * `asian-box-restaurant.softpage.in` map via `GET /api/v1/public/store/by-host`.
 * Localhost / preview falls back to `NEXT_PUBLIC_STORE_SUBDOMAIN` → `by-subdomain`
 * so branding still SSR-loads without a real tenant host.
 */
export const resolveTenant = cache(async (): Promise<TenantInfo | null> => {
  const headersList = await headers();
  const host = requestPublicHost(headersList);

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
