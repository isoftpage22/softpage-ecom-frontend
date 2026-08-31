import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { fetchMenuCatalog } from "@/lib/catalog/fetchMenuCatalog";
import { MenuHomeClient } from "./MenuHomeClient";

/**
 * Server Component: catalog is in the first HTML. Header/banners still render
 * on the client so Chakra chrome hydrates, but product rows are not gated
 * behind ClientOnly.
 */
export default async function MenuHomePage() {
  const tenant = await resolveTenant();
  const initialCatalog = await fetchMenuCatalog(tenant?.businessId);
  return <MenuHomeClient initialCatalog={initialCatalog} />;
}
