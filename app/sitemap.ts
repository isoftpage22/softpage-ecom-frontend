import type { MetadataRoute } from "next";
import { publicOrigin, resolveTenant } from "@/lib/tenant/resolveTenant";
import { apiOrigin } from "@/lib/api/origin";

function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** The store's sitemap from the API, on the address this menu is served from. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await resolveTenant();
  const origin = await publicOrigin();
  const home = origin ? `${origin}/` : "/";
  if (!tenant?.businessId) return [{ url: home }];
  try {
    const res = await fetch(
      `${apiOrigin()}/api/v1/public/store/sitemap?businessId=${tenant.businessId}&origin=${encodeURIComponent(origin)}`,
      { next: { tags: [`store:${tenant.businessId}`], revalidate: 300 } },
    );
    const json = await res.json();
    const xml = String(json?.data || "");
    const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
      const loc = match[1].match(/<loc>(.*?)<\/loc>/)?.[1];
      const lastmod = match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
      return loc ? { url: unescapeXml(loc), ...(lastmod ? { lastModified: lastmod } : {}) } : null;
    });
    const list = entries.filter((entry): entry is { url: string; lastModified?: string } => Boolean(entry));
    return list.length ? list : [{ url: home }];
  } catch {
    return [{ url: home }];
  }
}
