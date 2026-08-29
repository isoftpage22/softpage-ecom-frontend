"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetCategoriesQuery, useGetProductsQuery } from "@/store/api/productsApi";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { mapCatalogToProductList } from "@/lib/catalog/mapCatalog";
import { GET_PRODUCT_LIST_SUCCESS } from "@/src/Store/actionTypes";

/**
 * Loads the public GraphQL catalog and dispatches the same success action the
 * existing products reducer expects (`payload.data[0]` = `{ categories }`).
 */
export function useMenuCatalog() {
  const businessId = useBusinessId();
  const dispatch = useDispatch();
  const { data: productsData, isFetching, error } = useGetProductsQuery(
    {
      businessId,
      filters: { page: 1, pageSize: 100, inStock: true },
    },
    { skip: !businessId },
  );
  const { data: categories } = useGetCategoriesQuery(
    { businessId },
    { skip: !businessId },
  );

  useEffect(() => {
    if (error) {
      console.error("Menu catalog failed", error);
    }
    if (!productsData?.items) return;
    const list = mapCatalogToProductList(productsData.items, categories || []);
    dispatch({ type: GET_PRODUCT_LIST_SUCCESS, payload: { data: [list] } });
  }, [productsData, categories, dispatch, error]);

  return { isFetching };
}
