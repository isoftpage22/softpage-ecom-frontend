export function productDetailHref(product) {
  const target = product?.slug || product?.id;
  if (!target) return "/";
  return `/products/${encodeURIComponent(String(target))}`;
}

/** Menu dish links — Next should not prefetch every viewport card. */
export function isProductDetailHref(href) {
  const path = String(href || "").split("?")[0];
  return /^\/products\/[^/]+\/?$/.test(path);
}

/** UUID / legacy `item-` ids in `/products/[slug]` should use the by-id query. */
export function looksLikeCatalogItemId(value) {
  const key = decodeURIComponent(String(value || "")).trim();
  if (!key) return false;
  if (/^item-/i.test(key)) return true;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
}

export function flattenCatalogProducts(productList) {
  return (productList?.categories || []).flatMap((category) =>
    Array.isArray(category?.products) ? category.products : [],
  );
}

export function findCatalogProduct(productList, slugOrId) {
  const key = decodeURIComponent(String(slugOrId || "")).trim();
  if (!key) return null;
  return (
    flattenCatalogProducts(productList).find(
      (product) => String(product.id) === key || String(product.slug || "") === key,
    ) || null
  );
}

function hasImage(product) {
  return Boolean(productCardImage(product));
}

function isFeaturedProduct(product) {
  return (product?.tags || []).some((tag) => String(tag).toLowerCase() === "featured");
}

export function productCardImage(product) {
  return (
    product?.productImages?.[0]?.productImageUrl ||
    product?.media?.[0]?.url ||
    product?.categoryImage ||
    ""
  );
}

/**
 * Menu stores have no homepage theme builder. Recommended tiles come from
 * catalog: starred `featured` items first, otherwise any in-stock item with a photo.
 */
export function pickRecommendedProducts(products, limit = 8) {
  const withImage = (products || []).filter(hasImage);
  const featured = withImage.filter(isFeaturedProduct);
  return (featured.length ? featured : withImage).slice(0, limit);
}
