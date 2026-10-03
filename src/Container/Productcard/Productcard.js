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
  const dimmed = isOutOfStock ? 0.42 : 1
  const detailHref = productDetailHref(product)
  const rememberListingPosition = () => {
    saveListingRestore()
  }

  const handleAdd = () => {
    if (isOutOfStock) return
    if (hasOptions) {
      setOptionsOpen(true)
      return
    }
    addToCartProduct(product)
  }

  const handlePlus = () => {
    if (isOutOfStock) return
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

  return (
    <>
      <Card
        flexDirection={{ base: "row", lg: "column" }}
        alignItems={{ lg: "stretch" }}
        h={{ lg: "100%" }}
        p={{ lg: "12px" }}
        borderBottom={{ lg: "none" }}
        border={{ lg: "1px solid #EEE" }}
        borderRadius={{ lg: "12px" }}
      >
        <Flex direction="column" justify="flex-start" width={{ base: "62%", lg: "100%" }} pr={{ base: "16px", lg: "0" }} pt={{ lg: "10px" }} gap="6px" opacity={dimmed} order={{ lg: 2 }}>
          <VegMarker isVeg={!!product?.isVeg} mb="2px" />
          <Link to={detailHref} href={detailHref} onClick={rememberListingPosition} style={{ textDecoration: 'none' }}>
            <Text data-sp-title fontWeight="extrabold" variant="solid" maxW="100%" color="var(--sp-section-text, var(--chakra-colors-gray-700))" fontFamily="var(--sp-section-font, inherit)" fontSize="calc(1rem * var(--sp-section-scale, 1))" lineHeight="22px" noOfLines={2}>
              {product?.productName ?? 'God Knows'}
            </Text>
          </Link>
          <Flex alignItems="center" pt="2px">
            <Box alignSelf="center">₹</Box>
            <Text fontWeight="extrabold" variant="solid">
              {price}
            </Text>
          </Flex>
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
          {product?.productDesc ? (
          <Text pt="2px" color="black" variant="outline" onClick={onToggle} cursor="pointer">
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
              height={{ base: "75px", lg: "150px" }}
              borderRadius="5px"
              backgroundColor="#e4e1e1"
              mb="10px"
              loading="lazy"
              decoding="async"
              opacity={dimmed}
              filter={isOutOfStock ? "grayscale(0.35)" : "none"}
            />
          </Link>
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
         ) : quantity == 0 ?

         <Button onClick={handleAdd} alignSelf="center" colorScheme="none" size="sm" variant="solid">Add</Button>

          :
          <Box alignSelf="center" opacity={isOutOfStock ? 0.7 : 1}>
            <QtyStepper
              quantity={quantity}
              onDecrement={() => deleteToCartProduct(product)}
              onIncrement={handlePlus}
              incrementDisabled={isOutOfStock}
            />
          </Box>}
          {isOutOfStock && quantity > 0 ? (
            <Text mt="4px" fontSize="11px" lineHeight="14px" fontWeight="600" color="#C53030" textAlign="center" textTransform="none">
              Out of stock
            </Text>
          ) : hasOptions && !isOutOfStock ? (
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
