"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import PromotionCard from "../../../Container/PromotionCard/PromotionCard";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { catalogHasItems, mapCatalogItem } from "@/lib/catalog/mapCatalog";
import { isThemePreview } from "@/lib/theme-engine/previewSession";
import {
  flattenCatalogProducts,
  pickRecommendedProducts,
  productCardImage,
  productDetailHref,
} from "@/lib/catalog/href";

function fromResolved(items) {
  if (!Array.isArray(items) || !items.length) return [];
  return items.map((item) => ({
    id: item.id || item.slug || item.name,
    productName: item.name || item.productName || item.title,
    name: item.name || item.productName,
    slug: item.slug,
    productImages: item.image || item.productImages?.[0]?.productImageUrl
      ? [{ productImageUrl: item.image || item.productImages[0].productImageUrl }]
      : item.productImages || [],
    media: item.media,
    tags: item.tags,
  }));
}

const PLACEHOLDERS = [
  { id: "sp-rec-1", productName: "Signature dish" },
  { id: "sp-rec-2", productName: "Chef’s pick" },
  { id: "sp-rec-3", productName: "Popular item" },
];

const ProductPromotions = ({ initialCatalog, resolvedItems, title }) => {
  const businessId = useBusinessId();
  const productList = useSelector((state) => state.products.productList);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  const fromStore = catalogHasItems(productList)
    ? flattenCatalogProducts(productList)
    : flattenCatalogProducts(initialCatalog);

  const resolved = fromResolved(resolvedItems);
  const localRecommended = resolved.length ? resolved : pickRecommendedProducts(fromStore);
  const { data: productsData } = useGetProductsQuery(
    { businessId, filters: { page: 1, pageSize: 100, inStock: true } },
    { skip: !ready || !businessId || localRecommended.length > 0 },
  );

  const recommended = useMemo(() => {
    if (localRecommended.length) return localRecommended;
    if (fromStore.length) return fromStore.slice(0, 8);
    const mapped = (productsData?.items || []).map(mapCatalogItem).filter(Boolean);
    const picked = pickRecommendedProducts(mapped);
    if (picked.length) return picked;
    if (isThemePreview()) return PLACEHOLDERS;
    return [];
  }, [localRecommended, fromStore, productsData]);

  if (!recommended.length) return null;

  return (
    <Flex direction="column" bg="var(--sp-section-surface, var(--brand-secondary, #111))" w="100%">
      <Text data-sp-title color="var(--sp-section-text, white)" fontSize="var(--sp-section-heading, 13px)" fontFamily="var(--sp-section-font, inherit)" fontWeight="700" px="15px" pt="12px" letterSpacing="0">
        {title || "Recommended"}
      </Text>
      <Flex
        overflowX="scroll"
        overflowY="hidden"
        alignItems="flex-start"
        h="195px"
        w="100%"
        py="15px"
        px="15px"
        color="white"
        css={{
          "&::-webkit-scrollbar": {
            width: "1px",
          },
          "&::-webkit-scrollbar-track": {
            width: "1px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "none",
            borderRadius: "24px",
          },
        }}
      >
        <Flex justifyContent="space-between">
          {recommended.map((product, index) => (
            <PromotionCard
              key={product.id || `${product.productName}-${index}`}
              image={productCardImage(product)}
              href={product.id && String(product.id).startsWith("sp-rec-") ? undefined : productDetailHref(product)}
              heading={product.productName || product.name}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ProductPromotions;
