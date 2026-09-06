"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import PromotionCard from "../../../Container/PromotionCard/PromotionCard";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { catalogHasItems, mapCatalogItem } from "@/lib/catalog/mapCatalog";
import {
  flattenCatalogProducts,
  pickRecommendedProducts,
  productCardImage,
  productDetailHref,
} from "@/lib/catalog/href";
import { CHROME_BAR_BG } from "@/lib/menu/storeChrome";

const ProductPromotions = ({ initialCatalog }) => {
  const businessId = useBusinessId();
  const productList = useSelector((state) => state.products.productList);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  const fromStore = catalogHasItems(productList)
    ? flattenCatalogProducts(productList)
    : flattenCatalogProducts(initialCatalog);

  const localRecommended = pickRecommendedProducts(fromStore);
  const { data: productsData } = useGetProductsQuery(
    { businessId, filters: { page: 1, pageSize: 100, inStock: true } },
    { skip: !ready || !businessId || localRecommended.length > 0 },
  );

  const recommended = useMemo(() => {
    if (localRecommended.length) return localRecommended;
    const mapped = (productsData?.items || []).map(mapCatalogItem).filter(Boolean);
    return pickRecommendedProducts(mapped);
  }, [localRecommended, productsData]);

  if (!recommended.length) return null;

  return (
    <Flex direction="column" bg={CHROME_BAR_BG} w="100%">
      <Text color="white" fontSize="13px" fontWeight="700" px="15px" pt="12px" letterSpacing="0">
        Recommended
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
              key={product.id}
              image={productCardImage(product)}
              href={productDetailHref(product)}
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
