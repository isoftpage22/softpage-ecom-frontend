import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { fetchMenuCatalog } from "@/lib/catalog/fetchMenuCatalog";
import { fetchEnginePage } from "@/lib/theme-engine/fetchEnginePage";
import { metadataFromEngine } from "@/lib/theme-engine/metadata";
import { MenuHomeClient } from "../../MenuHomeClient";
import ProductDetail from "@/src/View/ProductDetail/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/products/${slug}`;
  const tenant = await resolveTenant();
  const engine = tenant?.businessId ? await fetchEnginePage(tenant.businessId, "menu", path) : null;
  return metadataFromEngine(engine, path);
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const path = `/products/${slug}`;
  const tenant = await resolveTenant();
  const initialCatalog = await fetchMenuCatalog(tenant?.businessId);
  const engine = tenant?.businessId ? await fetchEnginePage(tenant.businessId, "menu", path) : null;
  return (
    <MenuHomeClient
      initialCatalog={initialCatalog}
      engine={engine}
      fallback={<ProductDetail />}
    />
  );
}
