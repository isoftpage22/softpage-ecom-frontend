import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { fetchEnginePage } from "@/lib/theme-engine/fetchEnginePage";
import { metadataFromEngine } from "@/lib/theme-engine/metadata";
import StoreContentPage from "./content-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/pages/${slug}`;
  const tenant = await resolveTenant();
  const engine = tenant?.businessId ? await fetchEnginePage(tenant.businessId, "menu", path) : null;
  return metadataFromEngine(engine, path);
}

export default function Page() {
  return <StoreContentPage />;
}
