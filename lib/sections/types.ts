/**
 * Storefront mirror of the backend config-driven theme types. Kept in sync with
 * `new-softpagebusiness-nest-backend/src/modules/theme-builder/types/theme-config.types.ts`.
 * These describe the resolved `config.layout` + `config.themeConfig` the public
 * store resolver returns in the `by-host` payload.
 */

export type BindingSource =
  | "collection"
  | "tags"
  | "product-search"
  | "manual"
  | "best-sellers"
  | "latest"
  | "category"
  | "cms"
  | "campaign"
  | "external-url"
  | "internal-route";

export interface DataBinding {
  source: BindingSource;
  collectionSlug?: string;
  collectionId?: number;
  tags?: string[];
  productIds?: string[];
  categorySlug?: string;
  categoryId?: number;
  query?: string;
  limit?: number;
  sortBy?: string;
  url?: string;
  route?: string;
  cmsKey?: string;
}

/**
 * Where a slide / image / card lands when clicked. Authored in the admin builder
 * or owner settings and resolved to an href by `resolveLink`.
 */
export type LinkBehaviorType =
  | "product"
  | "category"
  | "route"
  | "url"
  | "none";

export interface LinkBehavior {
  type: LinkBehaviorType;
  productId?: string | number;
  productSlug?: string;
  categoryId?: string | number;
  categorySlug?: string;
  route?: string;
  url?: string;
}

export interface ThemeGlobalConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted?: string;
    border?: string;
  };
  typography?: {
    fontFamily?: string;
    headingFont?: string;
    baseSize?: string;
    scale?: number;
  };
  radius?: { base?: string; sm?: string; lg?: string };
  buttons?: { style?: "solid" | "outline" | "ghost"; radius?: string };
  shadows?: { card?: string };
  animations?: { enabled?: boolean };
  header?: { style?: string; sticky?: boolean };
  footer?: { style?: string };
  breakpoints?: { mobile?: number; tablet?: number };
  productCard?: { template?: string };
}

export interface SectionInstance {
  id: string;
  templateKey: string;
  componentKey: string;
  category: string;
  desktopTemplate?: string;
  mobileTemplate?: string;
  config: Record<string, any>;
  bindings: Record<string, DataBinding>;
  visible: boolean;
  order: number;
  ownerReorderable?: boolean;
  ownerHideable?: boolean;
  ownerEditableFields?: string[];
}

export type PageType =
  | "home"
  | "about"
  | "services"
  | "contact"
  | "blog"
  | "collections"
  | "generic";

export interface PageSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface PageConfig {
  key: string;
  /** Semantic page type used for capability gating + nav grouping. */
  pageType?: PageType;
  /** URL path relative to the storefront root, e.g. "/", "/about". */
  slug?: string;
  /** Human title used for navigation + metadata. */
  title?: string;
  seo?: PageSeo;
  /** Hide from auto-generated navigation. */
  hideFromNav?: boolean;
  sections: SectionInstance[];
}

export interface ThemePages {
  [pageKey: string]: PageConfig;
}
