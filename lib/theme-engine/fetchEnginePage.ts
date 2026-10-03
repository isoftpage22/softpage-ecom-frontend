import { apiOrigin } from "@/lib/api/origin";
import type { EnginePage } from "@/lib/theme-engine/ThemeEngineView";

export async function fetchEnginePage(
  businessId: number,
  app: "menu" | "storefront",
  route = "/",
  previewToken?: string | null,
): Promise<EnginePage | null> {
  const query = new URLSearchParams({
    businessId: String(businessId),
    app,
    route,
  });
  if (previewToken) query.set("previewToken", previewToken);
  try {
    const res = await fetch(`${apiOrigin()}/api/v1/public/store/page?${query.toString()}`, {
      ...(previewToken
        ? { cache: "no-store" as const }
        : { next: { tags: [`store:${businessId}`], revalidate: 60 } }),
    });
    const json = await res.json();
    if (json?.data?.enabled) return json.data as EnginePage;
  } catch {
    return null;
  }
  return null;
}
