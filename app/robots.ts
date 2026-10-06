import type { MetadataRoute } from "next";
import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { apiOrigin } from "@/lib/api/origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const tenant = await resolveTenant();
  const host = tenant?.customDomain || (tenant?.subdomain ? `${tenant.subdomain}.softpage.in` : "");
  const origin = host ? `https://${host}` : process.env.NEXT_PUBLIC_SITE_URL || "";
  try {
    const res = await fetch(`${apiOrigin()}/api/v1/public/store/robots?businessId=${tenant?.businessId || 0}&origin=${encodeURIComponent(origin)}`);
    const json = await res.json();
    const text = String(json?.data || "");
    const disallows = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("Disallow:"))
      .map((line) => line.slice("Disallow:".length).trim())
      .filter(Boolean);
    const sitemapLine = text.split("\n").map((line) => line.trim()).find((line) => line.startsWith("Sitemap:"));
    const sitemap = sitemapLine?.slice("Sitemap:".length).trim() || (origin ? `${origin}/sitemap.xml` : undefined);
    if (disallows.includes("/")) {
      return { rules: { userAgent: "*", disallow: "/" }, sitemap };
    }
    return { rules: { userAgent: "*", allow: "/", disallow: disallows }, sitemap };
  } catch {
    return { rules: { userAgent: "*", allow: "/" } };
  }
}
