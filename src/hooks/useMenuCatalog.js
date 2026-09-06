"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { productsApi, useGetCategoriesQuery } from "@/store/api/productsApi";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { catalogHasItems, mapCatalogToProductList } from "@/lib/catalog/mapCatalog";
import { MENU_PAGE_SIZE } from "@/lib/catalog/menuPaging";
import { GET_PRODUCT_LIST_SUCCESS } from "@/src/Store/actionTypes";

function mergeCatalogItems(current, incoming) {
  const seen = new Set(current.map((item) => item?.id).filter(Boolean));
  const next = [...current];
  for (const item of incoming || []) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  return next;
}

/**
 * Seeds Redux from the SSR catalog immediately, then refreshes from GraphQL
 * only when the server did not already send items (QR / client-only routes).
 * Loads 50 dishes first and appends further pages so the list is never replaced
 * with a smaller result.
 */
export function useMenuCatalog(initialCatalog) {
  const businessId = useBusinessId();
  const dispatch = useDispatch();
  const seeded = useRef(false);
  const itemsRef = useRef([]);
  const categoriesRef = useRef([]);
  const hasSsrCatalog = catalogHasItems(initialCatalog);

  useLayoutEffect(() => {
    if (seeded.current || !hasSsrCatalog) return;
    dispatch({ type: GET_PRODUCT_LIST_SUCCESS, payload: { data: [initialCatalog] } });
    seeded.current = true;
  }, [initialCatalog, dispatch, hasSsrCatalog]);

  const { data: categories } = useGetCategoriesQuery(
    { businessId },
    { skip: !businessId || hasSsrCatalog },
  );
  categoriesRef.current = categories || [];

  useEffect(() => {
    if (!itemsRef.current.length || hasSsrCatalog) return;
    const list = mapCatalogToProductList(itemsRef.current, categoriesRef.current);
    if (!catalogHasItems(list)) return;
    dispatch({ type: GET_PRODUCT_LIST_SUCCESS, payload: { data: [list] } });
  }, [categories, dispatch, hasSsrCatalog]);

  useEffect(() => {
    if (!businessId || hasSsrCatalog) return;
    let cancelled = false;
    const subscriptions = [];

    const publish = (items) => {
      itemsRef.current = items;
      const list = mapCatalogToProductList(items, categoriesRef.current);
      if (!catalogHasItems(list)) return;
      dispatch({ type: GET_PRODUCT_LIST_SUCCESS, payload: { data: [list] } });
    };

    const loadPage = (page) => {
      const sub = dispatch(
        productsApi.endpoints.getProducts.initiate({
          businessId,
          filters: { page, pageSize: MENU_PAGE_SIZE, inStock: true },
        }),
      );
      subscriptions.push(sub);
      return sub.unwrap();
    };

    (async () => {
      try {
        const first = await loadPage(1);
        if (cancelled) return;
        if (!Array.isArray(first?.items) || first.items.length === 0) return;
        let items = [...first.items];
        publish(items);

        const totalPages = Math.max(1, Number(first.totalPages) || 1);
        for (let page = 2; page <= totalPages; page += 1) {
          const extra = await loadPage(page);
          if (cancelled) return;
          items = mergeCatalogItems(items, extra?.items);
          publish(items);
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message || "request failed")
            : "request failed";
        console.error("Menu catalog failed", message);
      }
    })();

    return () => {
      cancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe?.());
    };
  }, [businessId, hasSsrCatalog, dispatch]);
}
