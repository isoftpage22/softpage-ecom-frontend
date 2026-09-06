"use client";

import { useGetProductsQuery } from "@/store/api/productsApi";
import { useBusinessId } from "@/lib/tenant/TenantContext";

export const MENU_SEARCH_MIN_LENGTH = 2;

/**
 * In-place menu search via GraphQL `ecommerceProducts` `filter.search`.
 * Does not write into Redux — the full catalog stays in `productList`.
 */
export function useMenuProductSearch(searchQuery) {
  const businessId = useBusinessId();
  const q = String(searchQuery || "").trim();
  const active = q.length >= MENU_SEARCH_MIN_LENGTH;
  const { data, isFetching, isError } = useGetProductsQuery(
    {
      businessId,
      filters: { search: q, inStock: true, page: 1, pageSize: 100 },
    },
    { skip: !businessId || !active },
  );

  const items = Array.isArray(data?.items) ? data.items : undefined;

  return {
    active,
    query: q,
    items,
    isFetching: active && isFetching,
    isError: active && isError,
    isPending: active && isFetching && items == null,
  };
}
