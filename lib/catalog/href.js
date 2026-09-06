export function productDetailHref(product) {
  const target = product?.slug || product?.id;
  if (!target) return "/";
  return `/products/${encodeURIComponent(String(target))}`;
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
  return Boolean(
    product?.productImages?.[0]?.productImageUrl || product?.media?.[0]?.url,
  );
}

function isFeaturedProduct(product) {
  return (product?.tags || []).some((tag) => String(tag).toLowerCase() === "featured");
}

export function productCardImage(product) {
  return product?.productImages?.[0]?.productImageUrl || product?.media?.[0]?.url || "";
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
