import type { LinkBehavior } from "./types";

/**
 * Resolve a configured LinkBehavior into a href.
 */
export function resolveLink(
  behavior?: LinkBehavior,
  fallback?: string,
): string | undefined {
  if (!behavior || !behavior.type) return fallback;

  switch (behavior.type) {
    case "product": {
      const target = behavior.productSlug || behavior.productId;
      return target ? `/products/${target}` : fallback;
    }
    case "category": {
      const target = behavior.categorySlug || behavior.categoryId;
      return target ? `/categories/${target}` : fallback;
    }
    case "route":
      return behavior.route || fallback;
    case "url":
      return behavior.url || fallback;
    case "none":
      return undefined;
    default:
      return fallback;
  }
}

/**
 * Map storefront builder routes onto this menu app (no /products catalog page).
 */
export function menuHref(href?: string | null): string | undefined {
  if (!href) return undefined;
  const trimmed = href.trim();
  if (!trimmed) return undefined;
  if (trimmed === "/products" || trimmed.startsWith("/products?")) return "/";
  if (trimmed.startsWith("/categories")) return "/";
  return trimmed;
}
