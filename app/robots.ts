import type { MetadataRoute } from "next";
import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { apiOrigin } from "@/lib/api/origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const tenant = await resolveTenant();
  try {
    const res = await fetch(`${apiOrigin()}/api/v1/public/store/robots?businessId=${tenant?.businessId || 0}&origin=`);
    const json = await res.json();
    const text = String(json?.data || "");
    const index = !text.includes("Disallow: /");
    return { rules: { userAgent: "*", allow: index ? "/" : undefined, disallow: index ? undefined : "/" } };
  } catch {
    return { rules: { userAgent: "*", allow: "/" } };
  }
}
