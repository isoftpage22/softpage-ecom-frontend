import { Box, Flex, Spacer, Text, useDisclosure, Button, Collapse, Image } from '@chakra-ui/react'
import React, { useState } from 'react'
import Card from '../../Components/Card/Card'
import QtyStepper from '../../Components/QtyStepper/QtyStepper'
import VegMarker from '../../Components/VegMarker/VegMarker'
import ProductCustomizationDrawer from '../ProductCustomizationDrawer/ProductCustomizationDrawer'
import ChooseLastItemDrawer from '../ChooseLastItemDrawer/ChooseLastItemDrawer'
import { Link } from '../../lib/nav'
import { DEFAULT_PRODUCT_IMAGE, productCardImage, productDetailHref } from '../../../lib/catalog/href'
import { saveListingRestore } from '@/lib/menu/listingRestore'
import {
  productHasOptions,
  cartPayloadFromSelection,
  cartPayloadFromLine,
  lastCartLineForProduct,
  isProductOutOfStock,
  catalogUnitPrice,
} from '../../../lib/catalog/options'
import { isAtMax, qtyLimitLabel } from '@/lib/cart/orderLimits'
import { useItemAvailability } from '@/lib/menu/itemAvailability'

function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ''))
}

const ProductCard = (props) => {
  const { product, addToCartProduct, addToCart, quantity, deleteToCartProduct } = props
  const { isOpen, onToggle } = useDisclosure()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [repeatOpen, setRepeatOpen] = useState(false)
  const price = catalogUnitPrice(product)
  const hasOptions = productHasOptions(product)
  const lastLine = lastCartLineForProduct(addToCart?.products, product?.id)
  const isOutOfStock = isProductOutOfStock(product)
  const timing = useItemAvailability(product)
  // Outside the dish's serving times (e.g. a dinner-only dish at 4 pm).
  const notServedNow = !timing.availableNow
  const dimmed = isOutOfStock || notServedNow ? 0.42 : 1
  const detailHref = productDetailHref(product)
  const rememberListingPosition = () => {
    saveListingRestore()
  }

  const handleAdd = () => {
    if (isOutOfStock || notServedNow) return
    if (hasOptions) {
      setOptionsOpen(true)
      return
    }
    addToCartProduct(product)
  }

  const handlePlus = () => {
    if (isOutOfStock || notServedNow || isAtMax(quantity, product)) return
    if (hasOptions) {
      setRepeatOpen(true)
      return
    }
    addToCartProduct(product)
  }

  const handleConfirm = (selection) => {
    addToCartProduct(cartPayloadFromSelection(product, selection))
    setOptionsOpen(false)
  }

  const handleRepeat = () => {
    setRepeatOpen(false)
    if (lastLine) {
      addToCartProduct(cartPayloadFromLine(product, lastLine))
      return
    }
    setOptionsOpen(true)
  }

  if (timing.hidden && notServedNow && quantity == 0) return null

  return (
    <>
      <Card
        flexDirection={{ base: "row", lg: "column" }}
        alignItems={{ lg: "stretch" }}
        h={{ lg: "100%" }}
        p={{ lg: "12px" }}
        position={{ lg: "relative" }}
        bg={{ lg: "white" }}
        borderBottom={{ lg: "none" }}
        border={{ lg: "1px solid" }}
        borderColor={{ lg: "gray.100" }}
        borderRadius={{ lg: "14px" }}
        transition="box-shadow 0.15s ease, transform 0.15s ease"
        _hover={{ lg: { boxShadow: "0 8px 24px rgba(15,23,42,0.08)" } }}
      >
        <Flex direction="column" justify="flex-start" width={{ base: "62%", lg: "100%" }} flex={{ lg: "1" }} pr={{ base: "16px", lg: "0" }} pt={{ lg: "12px" }} gap="6px" opacity={dimmed} order={{ lg: 2 }}>
          <VegMarker isVeg={!!product?.isVeg} mb="2px" />
          <Link to={detailHref} href={detailHref} onClick={rememberListingPosition} style={{ textDecoration: 'none' }}>
            <Text data-sp-title fontWeight="extrabold" variant="solid" maxW="100%" color="var(--sp-section-text, var(--chakra-colors-gray-700))" fontFamily="var(--sp-section-font, inherit)" fontSize="calc(1rem * var(--sp-section-scale, 1))" lineHeight="22px" noOfLines={2}>
              {product?.productName ?? 'God Knows'}
            </Text>
          </Link>
          <Flex alignItems="center" pt={{ base: "2px", lg: "8px" }} mt={{ lg: "auto" }} order={{ lg: 3 }} minH={{ lg: "32px" }} pr={{ lg: "96px" }}>
            <Box alignSelf="center">₹</Box>
            <Text fontWeight="extrabold" variant="solid">
              {price}
            </Text>
          </Flex>
          <Box order={{ lg: 1 }}>
          <Collapse startingHeight={20} in={isOpen}>
            {looksLikeHtml(product?.productDesc) ? (
              <Box
                fontSize="12px"
                lineHeight="18px"
                w="100%"
                color="gray.500"
                className="store-cms"
                sx={{
                  p: { m: 0, fontSize: '12px', lineHeight: '18px' },
                  ul: { m: 0, pl: '16px', fontSize: '12px', lineHeight: '18px' },
                  ol: { m: 0, pl: '16px', fontSize: '12px', lineHeight: '18px' },
                }}
                dangerouslySetInnerHTML={{ __html: product.productDesc }}
              />
            ) : (
              <Text fontSize="12px" lineHeight="18px" w="100%" variant="outline" noOfLines={isOpen ? undefined : 1}>
                {product?.productDesc}
              </Text>
            )}
          </Collapse>
          </Box>
          {product?.productDesc ? (
          <Text pt="2px" color="black" variant="outline" onClick={onToggle} cursor="pointer" order={{ lg: 2 }} fontSize={{ lg: "12px" }} fontWeight={{ lg: "600" }}>
            Show {isOpen ? "Less" : "More"}
          </Text>
          ) : null}
        </Flex>
        <Spacer display={{ lg: "none" }} />
        <Flex flexDirection="column" alignItems={{ base: "center", lg: "stretch" }} flexShrink={0} ml={{ base: "12px", lg: "0" }} order={{ lg: 1 }}>
          <Link to={detailHref} href={detailHref} onClick={rememberListingPosition}>
            <Image
              alignSelf="center"
              src={productCardImage(product) || DEFAULT_PRODUCT_IMAGE}
              alt={product?.productName || ""}
              objectFit="cover"
              width={{ base: "110px", lg: "100%" }}
              height={{ base: "75px", lg: "168px" }}
              borderRadius={{ base: "5px", lg: "10px" }}
              backgroundColor="#e4e1e1"
              mb={{ base: "10px", lg: "0" }}
              loading="lazy"
              decoding="async"
              opacity={dimmed}
              filter={isOutOfStock ? "grayscale(0.35)" : "none"}
            />
          </Link>
         <Flex
           direction="column"
           align={{ base: "center", lg: "flex-end" }}
           position={{ lg: "absolute" }}
           right={{ lg: "12px" }}
           bottom={{ lg: "12px" }}
         >
         {isOutOfStock && quantity == 0 ? (
          <Text
            fontSize="12px"
            fontWeight="700"
            color="#8A8A8A"
            textAlign="center"
            textTransform="none"
            letterSpacing="0"
          >
            Sold out
          </Text>
         ) : notServedNow && quantity == 0 ? (
          <Text
            maxW="110px"
            fontSize="12px"
            lineHeight="15px"
            fontWeight="700"
            color="#8A8A8A"
            textAlign="center"
            textTransform="none"
            letterSpacing="0"
          >
            {timing.label}
          </Text>
         ) : quantity == 0 ?

         <Button onClick={handleAdd} alignSelf="center" colorScheme="none" size="sm" variant="solid">Add</Button>

          :
          <Box alignSelf="center" opacity={isOutOfStock ? 0.7 : 1}>
            <QtyStepper
              quantity={quantity}
              onDecrement={() => deleteToCartProduct(product)}
              onIncrement={handlePlus}
              incrementDisabled={isOutOfStock || notServedNow || isAtMax(quantity, product)}
            />
          </Box>}
          {qtyLimitLabel(product) ? (
            <Text mt="4px" fontSize="11px" lineHeight="14px" color="gray.500" textAlign="center" textTransform="none">
              {qtyLimitLabel(product)}
            </Text>
          ) : null}
          {isOutOfStock && quantity > 0 ? (
            <Text mt="4px" fontSize="11px" lineHeight="14px" fontWeight="600" color="#C53030" textAlign="center" textTransform="none">
              Out of stock
            </Text>
          ) : notServedNow && quantity > 0 ? (
            <Text mt="4px" maxW="110px" fontSize="11px" lineHeight="14px" fontWeight="600" color="#C53030" textAlign="center" textTransform="none">
              {timing.label}
            </Text>
          ) : hasOptions && !isOutOfStock && !notServedNow ? (
            <Text
              mt="4px"
              fontSize="11px"
              lineHeight="14px"
              fontWeight="500"
              color="#787676"
              textAlign="center"
              textTransform="none"
            >
              customisable
            </Text>
          ) : null}
         </Flex>
        </Flex>
      </Card>
      <ProductCustomizationDrawer
        product={product}
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onConfirm={handleConfirm}
      />
      <ChooseLastItemDrawer
        isOpen={repeatOpen}
        onClose={() => setRepeatOpen(false)}
        onRepeat={handleRepeat}
        onChoose={() => {
          setRepeatOpen(false)
          setOptionsOpen(true)
        }}
      />
    </>
  )
}

export default ProductCard
