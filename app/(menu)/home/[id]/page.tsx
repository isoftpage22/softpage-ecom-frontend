import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { fetchMenuCatalog } from "@/lib/catalog/fetchMenuCatalog";
import Home from "@/src/View/Home";

export default async function HomeByIdPage() {
  const tenant = await resolveTenant();
  const initialCatalog = await fetchMenuCatalog(tenant?.businessId);
  return <Home initialCatalog={initialCatalog} />;
}
