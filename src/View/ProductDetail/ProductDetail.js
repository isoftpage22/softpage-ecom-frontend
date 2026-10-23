"use client";

import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { trackWhenReady } from "@/lib/ads/track";
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
import { useBusinessId, useStoreConfig } from "@/lib/tenant/TenantContext";
import ShareButton from "../../Components/ShareButton/ShareButton";
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
import { MENU_MAX_WIDTH } from "@/components/MenuContainer";
import { isAtMax, qtyLimitLabel } from '@/lib/cart/orderLimits'

function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ""));
}

const ProductDetail = ({ embedded = false } = {}) => {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const businessId = useBusinessId();
  const storeConfig = useStoreConfig();
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

  useEffect(() => {
    if (!product?.id) return undefined;
    return trackWhenReady("ViewContent", {
      content_ids: [product.id],
      content_name: product.productName,
      content_type: "product",
      value: Number(price) || 0,
    });
    // One view per product, not per price recalculation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const handleAdd = () => {
    if (!product || isOutOfStock) return;
    if (hasOptions) {
      setOptionsOpen(true);
      return;
    }
    dispatch(addToCartProduct(product));
  };

  const handlePlus = () => {
    if (!product || isOutOfStock || isAtMax(quantity, product)) return;
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
      <Box bg={CHROME_SURFACE} color={CHROME_TEXT}>
        <Box maxW={{ lg: MENU_MAX_WIDTH }} mx="auto" px={{ base: 0, lg: "24px" }} pt={{ base: 0, lg: "24px" }} pb={{ base: "24px", lg: "48px" }}>
          <Flex as="nav" aria-label="Breadcrumb" display={{ base: "none", lg: "flex" }} align="center" gap="6px" mb="16px" fontSize="13px" color="#6b7280" flexWrap="wrap">
            <Link to="/" href="/" style={{ color: "inherit" }}>Menu</Link>
            {product.categoryName ? (
              <>
                <Text as="span">/</Text>
                <Text as="span">{product.categoryName}</Text>
              </>
            ) : null}
            <Text as="span">/</Text>
            <Text as="span" color="#111827" fontWeight="600" noOfLines={1}>{product.productName}</Text>
          </Flex>
          <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }} gap={{ base: 0, lg: "40px" }} alignItems="start">
            <Box borderRadius={{ base: 0, lg: "16px" }} overflow="hidden" bg="#f3f4f6">
              <ProductImageSlider images={product.productImages} alt={product.productName} />
            </Box>
            <Box px={{ base: "16px", lg: 0 }} pt={{ base: "16px", lg: "4px" }} minW={0}>
              <Flex align="center" gap="8px" mb="10px" flexWrap="wrap">
                <VegMarker isVeg={!!product.isVeg} />
                <Text fontSize="12px" fontWeight="700" color={product.isVeg ? "#15803d" : "#b91c1c"} textTransform="uppercase" letterSpacing="0.06em">
                  {product.isVeg ? "Veg" : "Non-veg"}
                </Text>
                {product.categoryName ? (
                  <Text fontSize="12px" color="#6b7280">· {product.categoryName}</Text>
                ) : null}
              </Flex>
              <Flex align="flex-start" justify="space-between" gap="12px" mb="16px">
                <Text as="h1" fontSize={{ base: "22px", lg: "30px" }} fontWeight="800" lineHeight={{ base: "28px", lg: "38px" }} minW={0}>
                  {product.productName}
                </Text>
                <ShareButton
                  title={product.productName}
                  text={`${product.productName} – ₹${price}${storeConfig.name ? ` at ${storeConfig.name}` : ""}`}
                />
              </Flex>

              <Flex
                align="center"
                justify="space-between"
                gap="16px"
                p="14px"
                mb="20px"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="14px"
                bg="white"
              >
                <Box minW={0}>
                  <Flex align="baseline" gap="8px">
                    <Text fontSize={{ base: "20px", lg: "24px" }} fontWeight="800" color="#111827">
                      ₹{price}
                    </Text>
                    {product.compareAtPrice && product.compareAtPrice > price ? (
                      <Text fontSize="14px" color="#9ca3af" textDecoration="line-through">
                        ₹{product.compareAtPrice}
                      </Text>
                    ) : null}
                  </Flex>
                  {hasOptions && !isOutOfStock ? (
                    <Text fontSize="12px" color="#6b7280" mt="2px">Customisable</Text>
                  ) : null}
                </Box>
                {isOutOfStock && quantity === 0 ? (
                  <Text fontSize="14px" fontWeight="700" color="#8A8A8A" flexShrink={0}>
                    Sold out
                  </Text>
                ) : quantity === 0 ? (
                  <Button
                    onClick={handleAdd}
                    flexShrink={0}
                    h="44px"
                    minW={{ base: "132px", lg: "160px" }}
                    px="20px"
                    borderRadius="10px"
                    bg="var(--brand-secondary, #111)"
                    color="white"
                    fontSize="15px"
                    fontWeight="700"
                    textTransform="none"
                    _hover={{ opacity: 0.9 }}
                    _active={{ opacity: 0.85 }}
                  >
                    Add to cart
                  </Button>
                ) : (
                  <QtyStepper
                    size="md"
                    quantity={quantity}
                    onDecrement={() => dispatch(deleteToCartProduct(product))}
                    onIncrement={handlePlus}
                    incrementDisabled={isOutOfStock || isAtMax(quantity, product)}
                  />
                )}
              </Flex>
              {qtyLimitLabel(product) ? (
                <Text fontSize="13px" color="#6b7280" textTransform="none">{qtyLimitLabel(product)}</Text>
              ) : null}

              {description ? (
                <Box>
                  <Text fontSize="13px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color="#6b7280" mb="8px">
                    About this dish
                  </Text>
                  {looksLikeHtml(description) ? (
                    <Box
                      fontSize="15px"
                      lineHeight="24px"
                      color="#374151"
                      className="store-cms"
                      sx={{
                        p: { mb: "10px" },
                        ul: { pl: "18px", mb: "10px" },
                        ol: { pl: "18px", mb: "10px" },
                      }}
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  ) : (
                    <Text fontSize="15px" lineHeight="24px" color="#374151" whiteSpace="pre-wrap">
                      {description}
                    </Text>
                  )}
                </Box>
              ) : null}
            </Box>
          </Grid>
        </Box>
      </Box>
      {embedded ? null : <Footer />}
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
