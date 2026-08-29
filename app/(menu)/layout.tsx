import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolveTenant";
import { TenantProvider } from "@/lib/tenant/TenantContext";
import {
  buildThemeCss,
  buildGlobalConfigCss,
  buildFontHref,
} from "@/lib/theme/brandPalette";
import { PersistStoreInfo } from "@/src/hooks/PersistStoreInfo";
import { PersistMenuCart } from "@/src/hooks/PersistMenuCart";
import { StoreClosedScreen } from "@/components/StoreClosedScreen";
import { MenuAuthChrome } from "@/components/MenuAuthChrome";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await resolveTenant();
  const name = tenant?.config?.name || tenant?.name;
  const iconUrl =
    tenant?.config?.favicon || tenant?.config?.logo || tenant?.logo || undefined;
  const shareImage = tenant?.config?.shareImage || undefined;
  if (!name && !iconUrl) return {};
  return {
    title: name ? { default: name, template: `%s | ${name}` } : undefined,
    description: tenant?.config?.description || undefined,
    icons: iconUrl
      ? {
          icon: [{ url: iconUrl }],
          shortcut: [{ url: iconUrl }],
          apple: [{ url: iconUrl }],
        }
      : undefined,
    openGraph: shareImage ? { images: [{ url: shareImage }] } : undefined,
  };
}

/**
 * Server layout: host tenant + theme CSS vars. No ShopLayout — existing
 * Chakra screens own the chrome.
 */
export default async function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await resolveTenant();
  const themeCss = tenant?.config?.themeConfig
    ? buildGlobalConfigCss(tenant.config.themeConfig)
    : tenant?.config?.theme
      ? buildThemeCss(tenant.config.theme)
      : "";
  const fontHref = buildFontHref(tenant?.config?.themeConfig);
  const isStoreOpen = tenant?.config?.isStoreOpen ?? tenant?.isStoreOpen ?? true;

  return (
    <>
      {fontHref ? (
        <link rel="stylesheet" href={fontHref} />
      ) : null}
      {themeCss ? (
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      ) : null}
      <TenantProvider tenant={tenant}>
      <PersistStoreInfo />
      <PersistMenuCart />
      <MenuAuthChrome />
      {isStoreOpen ? children : <StoreClosedScreen />}
      </TenantProvider>
    </>
  );
}
