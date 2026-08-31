"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useGetCategoriesQuery, useGetProductsQuery } from "@/store/api/productsApi";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { catalogHasItems, mapCatalogToProductList } from "@/lib/catalog/mapCatalog";
import { GET_PRODUCT_LIST_SUCCESS } from "@/src/Store/actionTypes";

/**
 * Seeds Redux from the SSR catalog immediately, then refreshes from GraphQL
 * only when the server did not already send items (QR / client-only routes).
 */
export function useMenuCatalog(initialCatalog) {
  const businessId = useBusinessId();
  const dispatch = useDispatch();
  const seeded = useRef(false);
  const hasSsrCatalog = catalogHasItems(initialCatalog);

  useLayoutEffect(() => {
    if (seeded.current || !hasSsrCatalog) return;
    dispatch({ type: GET_PRODUCT_LIST_SUCCESS, payload: { data: [initialCatalog] } });
    seeded.current = true;
  }, [initialCatalog, dispatch, hasSsrCatalog]);

  const { data: productsData, error } = useGetProductsQuery(
    {
      businessId,
      filters: { page: 1, pageSize: 100, inStock: true },
    },
    { skip: !businessId || hasSsrCatalog },
  );
  const { data: categories } = useGetCategoriesQuery(
    { businessId },
    { skip: !businessId || hasSsrCatalog },
  );

  useEffect(() => {
    if (error && typeof error === "object" && "message" in error) {
      console.error("Menu catalog failed", String(error.message || "request failed"));
    }
    if (!Array.isArray(productsData?.items) || productsData.items.length === 0) return;
    const list = mapCatalogToProductList(productsData.items, categories || []);
    if (!catalogHasItems(list)) return;
    dispatch({ type: GET_PRODUCT_LIST_SUCCESS, payload: { data: [list] } });
  }, [productsData, categories, dispatch, error]);
}
