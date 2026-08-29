"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeGlobalConfig, ThemePages } from "@/lib/sections/types";

export interface StorefrontTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface StorefrontSocial {
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  telegram: string | null;
}

export interface StorefrontContact {
  phone: string | null;
  email: string | null;
  supportPhone?: string | null;
  supportEmail?: string | null;
  website: string | null;
  phones?: { primary: string | null; secondary: string | null; support: string | null };
  emails?: { primary: string | null; secondary: string | null; support: string | null };
}

export interface StorefrontPage {
  key: string;
  slug: string;
  title: string;
  content: string;
  group: "company" | "legal";
}

/**
 * Online-payment config resolved by the backend. `mode: "platform"` means the
 * store transacts through Softpage's account (escrow); `"own"` means the
 * merchant connected their own Razorpay keys. `keyId` is the public key for
 * platform mode; for own mode the authoritative key is issued per checkout.
 */
export interface StorefrontPaymentConfig {
  provider: "razorpay";
  enabled: boolean;
  mode: "platform" | "own";
  keyId: string | null;
  /** Whether Cash on Delivery is offered at checkout for this store. */
  codEnabled: boolean;
}

/** Shipping source: merchant profiles, Softpage platform delivery, or none. */
export interface StorefrontShippingConfig {
  enabled: boolean;
  source: "business" | "platform" | "none";
}

/**
 * Feature capabilities derived from the business's installed apps and active
 * bookables. Drives which call-to-action buttons the storefront renders.
 */
export interface StorefrontCapabilities {
  onlineOrdering: boolean;
  tableReservation: boolean;
  bookable: boolean;
  bookableStrategies: string[];
}

export interface StorefrontConfig {
  name: string;
  description: string | null;
  logo: string | null;
  /** Browser tab icon; falls back to logo when unset. */
  favicon?: string | null;
  /** Open Graph / social share image when available. */
  shareImage?: string | null;
  currency: string;
  theme: StorefrontTheme;
  social: StorefrontSocial;
  contact: StorefrontContact;
  pages: StorefrontPage[];
  isStoreOpen: boolean;
  /** Config-driven theme layer (resolved by the backend public store service). */
  themeConfig?: ThemeGlobalConfig | null;
  layout?: ThemePages;
  /** Online payment config (own keys vs Softpage platform/escrow account). */
  payment?: StorefrontPaymentConfig;
  /** Shipping config source (merchant profiles vs Softpage platform delivery). */
  shipping?: StorefrontShippingConfig;
  /** Feature capabilities derived from installed apps + active bookables. */
  capabilities?: StorefrontCapabilities;
  /** Canonical business vertical (restaurant | clinic | salon | ...) for industry-aware wording. */
  vertical?: string | null;
}

export interface TenantInfo {
  businessId: number;
  businessAppId?: number | null;
  name: string;
  subdomain: string;
  customDomain: string | null;
  themeId: string;
  logo: string | null;
  isStoreOpen: boolean;
  systemUrl: string;
  config?: StorefrontConfig;
}

const ENV_BUSINESS_ID = parseInt(process.env.NEXT_PUBLIC_BUSINESS_ID || "1", 10);
const ENV_BUSINESS_APP_ID = parseInt(
  process.env.NEXT_PUBLIC_BUSINESS_APP_ID || "1",
  10,
);

const QR_OVERRIDE_KEY = "qrTenantOverride";

export type QrTenantOverride = {
  businessId: number;
  businessAppId?: number | null;
};

export function setQrTenantOverride(info: QrTenantOverride | null): void {
  if (typeof window === "undefined") return;
  if (!info?.businessId) {
    window.localStorage.removeItem(QR_OVERRIDE_KEY);
  } else {
    window.localStorage.setItem(QR_OVERRIDE_KEY, JSON.stringify(info));
  }
  window.dispatchEvent(new Event("qr-tenant-override"));
}

function readQrOverride(): QrTenantOverride | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QR_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QrTenantOverride;
    if (!parsed?.businessId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function useQrTenantOverride(): QrTenantOverride | null {
  const [override, setOverride] = useState<QrTenantOverride | null>(null);
  useEffect(() => {
    const sync = () => setOverride(readQrOverride());
    sync();
    window.addEventListener("qr-tenant-override", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("qr-tenant-override", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return override;
}

const TenantContext = createContext<TenantInfo | null>(null);

/**
 * Provides the host-resolved tenant to client components. Rendered by the
 * storefront layout (a Server Component) with the value resolved from the
 * request Host header. When `tenant` is null, hooks fall back to env vars so
 * local/dev and the POS (which has no provider) keep working.
 */
export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantInfo | null;
  children: React.ReactNode;
}) {
  return <TenantContext value={tenant}>{children}</TenantContext>;
}

export function useTenant(): TenantInfo | null {
  return useContext(TenantContext);
}

/** Resolved businessId for the current storefront host (QR override, then env). */
export function useBusinessId(): number {
  const tenant = useContext(TenantContext);
  const override = useQrTenantOverride();
  return override?.businessId ?? tenant?.businessId ?? ENV_BUSINESS_ID;
}

/** Resolved businessAppId (QR override, then env). */
export function useBusinessAppId(): number {
  const tenant = useContext(TenantContext);
  const override = useQrTenantOverride();
  return override?.businessAppId ?? tenant?.businessAppId ?? ENV_BUSINESS_APP_ID;
}

const DEFAULT_CONFIG: StorefrontConfig = {
  name: "Store",
  description: null,
  logo: null,
  favicon: null,
  shareImage: null,
  currency: "INR",
  theme: {
    primary: "#3B82F6",
    secondary: "#1F2937",
    accent: "#F59E0B",
    background: "#FFFFFF",
    text: "#111827",
  },
  social: {
    facebook: null,
    instagram: null,
    twitter: null,
    youtube: null,
    linkedin: null,
    whatsapp: null,
    telegram: null,
  },
  contact: {
    phone: null,
    email: null,
    supportPhone: null,
    supportEmail: null,
    website: null,
    phones: { primary: null, secondary: null, support: null },
    emails: { primary: null, secondary: null, support: null },
  },
  pages: [],
  isStoreOpen: true,
  themeConfig: null,
  layout: {},
  payment: { provider: "razorpay", enabled: true, mode: "platform", keyId: null, codEnabled: true },
  shipping: { enabled: true, source: "platform" },
  capabilities: { onlineOrdering: false, tableReservation: false, bookable: false, bookableStrategies: [] },
};

/**
 * Resolved storefront branding/config for the current tenant. Falls back to
 * sensible defaults when the host couldn't be resolved (dev / POS), so
 * components can render unconditionally.
 */
export function useStoreConfig(): StorefrontConfig {
  const tenant = useContext(TenantContext);
  return tenant?.config ?? DEFAULT_CONFIG;
}

/** Resolved config-driven page layout for the current tenant (may be empty). */
export function useStoreLayout(): ThemePages {
  const tenant = useContext(TenantContext);
  return tenant?.config?.layout ?? {};
}

/** Resolved online-payment config (own keys vs Softpage platform account). */
export function useStorePaymentConfig(): StorefrontPaymentConfig {
  const tenant = useContext(TenantContext);
  return tenant?.config?.payment ?? DEFAULT_CONFIG.payment!;
}

/** Resolved shipping config source (merchant profiles vs Softpage platform). */
export function useStoreShippingConfig(): StorefrontShippingConfig {
  const tenant = useContext(TenantContext);
  return tenant?.config?.shipping ?? DEFAULT_CONFIG.shipping!;
}

/** Resolved feature capabilities (installed apps + active bookables). */
export function useStoreCapabilities(): StorefrontCapabilities {
  const tenant = useContext(TenantContext);
  return tenant?.config?.capabilities ?? DEFAULT_CONFIG.capabilities!;
}

/** Store slug used by public logistics (delivery-area / serviceability). */
export function useStoreSlug(): string {
  const tenant = useContext(TenantContext);
  return tenant?.subdomain || process.env.NEXT_PUBLIC_STORE_SUBDOMAIN || "";
}
