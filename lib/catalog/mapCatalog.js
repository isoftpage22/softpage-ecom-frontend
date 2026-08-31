/**
 * Map storefront GraphQL catalog (`ecommerceProducts` + `ecommerceCategories`)
 * into the CRA Home shape: `{ categories: [{ categoryName, products: [...] }] }`.
 */
export function mapCatalogToProductList(items = [], categories = []) {
  const byCat = new Map();
  for (const category of categories) {
    if (category?.id == null) continue;
    byCat.set(Number(category.id), {
      categoryName: category.name || "Menu",
      products: [],
    });
  }

  const uncategorized = { categoryName: "Menu", products: [] };

  for (const item of items) {
    if (!item) continue;
    const price = Number(item.price) || 0;
    const compare = item.compareAtPrice != null ? Number(item.compareAtPrice) : null;
    const mapped = {
      id: item.id,
      productName: item.name,
      productDesc: item.description || item.shortName || "",
      price,
      productCost: price,
      compareAtPrice: compare && compare > 0 ? compare : null,
      productImages: (item.media || []).map((media) => ({
        productImageUrl: media.url,
      })),
      categoryId: item.categoryId,
      isVeg: item.isVeg === true,
      tags: Array.isArray(item.tags) ? item.tags : [],
      variants: (item.variants || []).map((variant) => ({
        ...variant,
        trackQuantity: variant.trackQuantity === true || item.trackQuantity === true,
        allowBackorder: variant.allowBackorder === true || item.allowBackorder !== false,
        availableQuantity:
          item.trackQuantity === true
            ? variant.availableQuantity == null || variant.availableQuantity === ""
              ? null
              : Number(variant.availableQuantity)
            : null,
      })),
      addonGroups: item.addonGroups || [],
      comboGroups: item.comboGroups || [],
      isCombo: !!item.isCombo,
      taxClass: Number(item.taxClass) || 18,
      taxInclusive: item.taxInclusive !== false,
      status: item.status || null,
      trackQuantity: item.trackQuantity === true,
      allowBackorder: item.allowBackorder !== false,
      availableQuantity:
        item.availableQuantity == null || item.availableQuantity === ""
          ? null
          : Number(item.availableQuantity),
    };

    const bucket = item.categoryId != null ? byCat.get(Number(item.categoryId)) : null;
    if (bucket) bucket.products.push(mapped);
    else uncategorized.products.push(mapped);
  }

  const categoriesOut = [...byCat.values()].filter((entry) => entry.products.length > 0);
  if (uncategorized.products.length) categoriesOut.push(uncategorized);
  return { categories: categoriesOut };
}

export function catalogHasItems(catalog) {
  return Boolean(
    catalog &&
      Array.isArray(catalog.categories) &&
      catalog.categories.some(
        (category) => Array.isArray(category.products) && category.products.length > 0,
      ),
  );
}
