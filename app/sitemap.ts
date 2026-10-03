import type { MetadataRoute } from "next";
import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { apiOrigin } from "@/lib/api/origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await resolveTenant();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (!tenant?.businessId) return [{ url: origin || "/", lastModified: new Date() }];
  try {
    const res = await fetch(`${apiOrigin()}/api/v1/public/store/sitemap?businessId=${tenant.businessId}&origin=${encodeURIComponent(origin)}`);
    const json = await res.json();
    const xml = String(json?.data || "");
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    return locs.map((url) => ({ url, lastModified: new Date() }));
  } catch {
    return [{ url: origin || "/", lastModified: new Date() }];
  }
}
