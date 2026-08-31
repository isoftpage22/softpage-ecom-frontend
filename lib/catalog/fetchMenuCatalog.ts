import { cache } from "react";
import { apiOrigin } from "@/lib/api/origin";
import { mapCatalogToProductList } from "./mapCatalog";

export type MenuCatalog = ReturnType<typeof mapCatalogToProductList>;

const EMPTY_CATALOG: MenuCatalog = { categories: [] };
const PAGE_SIZE = 100;

const PRODUCT_FIELDS = `
  fragment ProductFields on ItemTypeGql {
    id
    name
    description
    shortName
    slug
    price
    compareAtPrice
    status
    categoryId
    availableQuantity
    isVeg
    tags
    trackQuantity
    allowBackorder
    media { id url altText type position }
    variants {
      id name sku price compareAtPrice barcode
      availableQuantity trackQuantity allowBackorder imageUrl
    }
    addonGroups {
      id name isRequired minSelections maxSelections
      options { id name price isDefault position }
    }
    isCombo
    comboGroups {
      id name isRequired minSelections maxSelections position
      components {
        id componentItemId componentVariantId name priceDelta
        quantity isDefault position imageUrl
      }
    }
  }
`;

const SLIM_PRODUCT_FIELDS = `
  fragment SlimProductFields on ItemTypeGql {
    id
    name
    description
    shortName
    slug
    price
    compareAtPrice
    status
    categoryId
    availableQuantity
    media { id url altText type position }
  }
`;

const FULL_PRODUCTS_QUERY = `
  ${PRODUCT_FIELDS}
  query GetProducts($businessId: Int!, $filter: CatalogFilterInput, $pagination: PaginationInput) {
    ecommerceProducts(businessId: $businessId, filter: $filter, pagination: $pagination) {
      items { ...ProductFields }
      total
      page
      pageSize
      totalPages
    }
  }
`;

const SLIM_PRODUCTS_QUERY = `
  ${SLIM_PRODUCT_FIELDS}
  query GetProductsSlim($businessId: Int!, $filter: CatalogFilterInput, $pagination: PaginationInput) {
    ecommerceProducts(businessId: $businessId, filter: $filter, pagination: $pagination) {
      items { ...SlimProductFields }
      total
      page
      pageSize
      totalPages
    }
  }
`;

const CATEGORIES_QUERY = `
  query GetCategories($businessId: Int!) {
    ecommerceCategories(businessId: $businessId) {
      id
      name
      slug
      description
      image
      bannerImage
      sortOrder
      isActive
      isFeatured
    }
  }
`;

type GraphqlPayload<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type ProductsPage = {
  items?: unknown[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

async function graphqlPost<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphqlPayload<T>> {
  try {
    const response = await fetch(`${apiOrigin()}/api/v1/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 30 },
    });
    if (!response.ok) return {};
    return (await response.json()) as GraphqlPayload<T>;
  } catch {
    return {};
  }
}

function catalogVariables(businessId: number, page: number) {
  return {
    businessId,
    filter: { inStock: true },
    pagination: { page, pageSize: PAGE_SIZE },
  };
}

async function fetchProductPages(
  businessId: number,
  query: string,
): Promise<unknown[] | null> {
  const first = await graphqlPost<{ ecommerceProducts?: ProductsPage }>(
    query,
    catalogVariables(businessId, 1),
  );
  const page = first.data?.ecommerceProducts;
  if (!Array.isArray(page?.items)) return null;

  const items = [...page.items];
  const totalPages = Math.max(1, Number(page.totalPages) || 1);
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        graphqlPost<{ ecommerceProducts?: ProductsPage }>(
          query,
          catalogVariables(businessId, index + 2),
        ),
      ),
    );
    for (const extra of rest) {
      const extraItems = extra.data?.ecommerceProducts?.items;
      if (Array.isArray(extraItems)) items.push(...extraItems);
    }
  }
  return items;
}

async function fetchCategories(businessId: number) {
  const result = await graphqlPost<{
    ecommerceCategories?: Array<{ id: number; name?: string }>;
  }>(CATEGORIES_QUERY, { businessId });
  return Array.isArray(result.data?.ecommerceCategories)
    ? result.data.ecommerceCategories
    : [];
}

/**
 * Server-side menu catalog for the host tenant. Cached per request via `cache()`
 * and revalidated every 30s so the first HTML includes items.
 */
export const fetchMenuCatalog = cache(async (businessId?: number | null): Promise<MenuCatalog> => {
  const id = Number(businessId);
  if (!Number.isFinite(id) || id <= 0) return EMPTY_CATALOG;

  const [fullItems, categories] = await Promise.all([
    fetchProductPages(id, FULL_PRODUCTS_QUERY),
    fetchCategories(id),
  ]);

  const items =
    fullItems ?? (await fetchProductPages(id, SLIM_PRODUCTS_QUERY)) ?? [];

  if (!items.length) return EMPTY_CATALOG;
  return mapCatalogToProductList(items, categories);
});
