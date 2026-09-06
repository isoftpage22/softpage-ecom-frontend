"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import TopBarWithBackButton from "../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import Footer from "../../Layout/Guest/Components/Footer";
import VegMarker from "../../Components/VegMarker/VegMarker";
import QtyStepper from "../../Components/QtyStepper/QtyStepper";
import ProductImageSlider from "../../Components/ProductImageSlider/ProductImageSlider";
import ProductCustomizationDrawer from "../../Container/ProductCustomizationDrawer/ProductCustomizationDrawer";
import ChooseLastItemDrawer from "../../Container/ChooseLastItemDrawer/ChooseLastItemDrawer";
import { Link } from "../../lib/nav";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import {
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
} from "@/store/api/productsApi";
import { mapCatalogItem } from "@/lib/catalog/mapCatalog";
import { findCatalogProduct, looksLikeCatalogItemId } from "@/lib/catalog/href";
import {
  productHasOptions,
  cartPayloadFromSelection,
  cartPayloadFromLine,
  lastCartLineForProduct,
  isProductOutOfStock,
  catalogUnitPrice,
  qtyForProduct,
} from "../../../lib/catalog/options";
import { addToCartProduct, deleteToCartProduct } from "../../Store/action/shoppingCart";
import { CHROME_SURFACE, CHROME_TEXT } from "@/lib/menu/storeChrome";

function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ""));
}

const ProductDetail = () => {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const businessId = useBusinessId();
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.products.productList);
  const addToCart = useSelector((state) => state.shoppingCart.addToCart);

  const fromList = findCatalogProduct(productList, slug);
  const hasCatalogHit = !!fromList;
  const looksLikeId = looksLikeCatalogItemId(slug);
  const bySlug = useGetProductBySlugQuery(
    { businessId, slug },
    { skip: !businessId || !slug || hasCatalogHit || looksLikeId },
  );
  const slugMissed = !bySlug.isLoading && !bySlug.isFetching && !bySlug.data;
  const byId = useGetProductByIdQuery(
    { businessId, id: slug },
    { skip: !businessId || !slug || hasCatalogHit || (!looksLikeId && !slugMissed) },
  );

  const remote = bySlug.data || byId.data;
  const product = fromList || (remote ? mapCatalogItem(remote) : null);
  const loading = !product && (bySlug.isLoading || byId.isLoading);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [repeatOpen, setRepeatOpen] = useState(false);

  const quantity = qtyForProduct(addToCart?.products, product?.id);
  const hasOptions = productHasOptions(product);
  const lastLine = lastCartLineForProduct(addToCart?.products, product?.id);
  const isOutOfStock = isProductOutOfStock(product);
  const price = catalogUnitPrice(product);
  const description = product?.productDesc || "";

  const handleAdd = () => {
    if (!product || isOutOfStock) return;
    if (hasOptions) {
      setOptionsOpen(true);
      return;
    }
    dispatch(addToCartProduct(product));
  };

  const handlePlus = () => {
    if (!product || isOutOfStock) return;
    if (hasOptions) {
      setRepeatOpen(true);
      return;
    }
    dispatch(addToCartProduct(product));
  };

  if (loading) {
    return (
      <>
        <TopBarWithBackButton headerText="Product" />
        <Box minH="40vh" bg={CHROME_SURFACE} />
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <TopBarWithBackButton headerText="Product" />
        <Box minH="40vh" px="24px" py="64px" textAlign="center" bg={CHROME_SURFACE} color={CHROME_TEXT}>
          <Text fontSize="22px" fontWeight="700" mb="8px">
            Item not found
          </Text>
          <Text mb="24px" opacity={0.7}>
            This item is not on the menu right now.
          </Text>
          <Link to="/" href="/">
            <Button variant="solidFull" bg="brand.500">
              Back to menu
            </Button>
          </Link>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBarWithBackButton headerText={product.productName} />
      <Box bg={CHROME_SURFACE} color={CHROME_TEXT} pb="24px">
        <ProductImageSlider images={product.productImages} alt={product.productName} />
        <Box px="16px" pt="16px">
          <Flex align="center" gap="8px" mb="6px">
            <VegMarker isVeg={!!product.isVeg} />
            <Text fontSize="20px" fontWeight="800" lineHeight="26px" noOfLines={3}>
              {product.productName}
            </Text>
          </Flex>
          <Flex align="center" mb="14px">
            <Text fontSize="18px" fontWeight="800">
              ₹{price}
            </Text>
            {product.compareAtPrice && product.compareAtPrice > price ? (
              <Text ml="8px" fontSize="14px" color="#888" textDecoration="line-through">
                ₹{product.compareAtPrice}
              </Text>
            ) : null}
          </Flex>
          {description ? (
            looksLikeHtml(description) ? (
              <Box
                fontSize="14px"
                lineHeight="22px"
                color="#4A4A4A"
                className="store-cms"
                sx={{
                  p: { mb: "10px" },
                  ul: { pl: "18px", mb: "10px" },
                  ol: { pl: "18px", mb: "10px" },
                }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <Text fontSize="14px" lineHeight="22px" color="#4A4A4A" whiteSpace="pre-wrap">
                {description}
              </Text>
            )
          ) : null}

          <Box mt="20px">
            {isOutOfStock && quantity === 0 ? (
              <Text fontSize="14px" fontWeight="700" color="#8A8A8A">
                Sold out
              </Text>
            ) : quantity === 0 ? (
              <Button onClick={handleAdd} colorScheme="none" variant="solidFull">
                Add to cart
              </Button>
            ) : (
              <QtyStepper
                size="md"
                quantity={quantity}
                onDecrement={() => dispatch(deleteToCartProduct(product))}
                onIncrement={handlePlus}
                incrementDisabled={isOutOfStock}
              />
            )}
            {hasOptions && !isOutOfStock ? (
              <Text mt="8px" fontSize="12px" color="#787676">
                Customisable
              </Text>
            ) : null}
          </Box>
        </Box>
      </Box>
      <Footer />
      <ProductCustomizationDrawer
        product={product}
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onConfirm={(selection) => {
          dispatch(addToCartProduct(cartPayloadFromSelection(product, selection)));
          setOptionsOpen(false);
        }}
      />
      <ChooseLastItemDrawer
        isOpen={repeatOpen}
        onClose={() => setRepeatOpen(false)}
        onRepeat={() => {
          setRepeatOpen(false);
          if (lastLine) {
            dispatch(addToCartProduct(cartPayloadFromLine(product, lastLine)));
            return;
          }
          setOptionsOpen(true);
        }}
        onChoose={() => {
          setRepeatOpen(false);
          setOptionsOpen(true);
        }}
      />
    </>
  );
};

export default ProductDetail;
