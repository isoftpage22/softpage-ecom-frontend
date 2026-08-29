import { Box, Flex, Spacer, Text, useDisclosure, Button, Collapse, Image } from '@chakra-ui/react'
import React, { useState } from 'react'
import Card from '../../Components/Card/Card'
import VegMarker from '../../Components/VegMarker/VegMarker'
import ProductCustomizationDrawer from '../ProductCustomizationDrawer/ProductCustomizationDrawer'
import ChooseLastItemDrawer from '../ChooseLastItemDrawer/ChooseLastItemDrawer'
import {
  productHasOptions,
  cartPayloadFromSelection,
  cartPayloadFromLine,
  lastCartLineForProduct,
  isProductOutOfStock,
  catalogUnitPrice,
} from '../../../lib/catalog/options'

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
      <Card>
        <Flex direction="column" justify="flex-start" width="62%" pr="16px" gap="6px" opacity={dimmed}>
          <VegMarker isVeg={!!product?.isVeg} mb="2px" />
          <Text fontWeight="extrabold" variant="solid" maxW="100%" color="gray.700" lineHeight="22px" noOfLines={2}>
            {product?.productName ?? 'God Knows'}
          </Text>
          <Flex alignItems="center" pt="2px">
            <Box alignSelf="center">₹</Box>
            <Text fontWeight="extrabold" variant="solid">
              {price}
            </Text>
          </Flex>
          <Collapse startingHeight={20} in={isOpen}>
            <Text fontSize="12px" lineHeight="18px" w="100%" variant="outline" noOfLines={isOpen ? undefined : 1}>
             {product?.productDesc}
            </Text>
          </Collapse>
          {product?.productDesc ? (
          <Text pt="2px" color="black" variant="outline" onClick={onToggle} cursor="pointer">
            Show {isOpen ? "Less" : "More"}
          </Text>
          ) : null}
        </Flex>
        <Spacer />
        <Flex flexDirection="column" alignItems="center" flexShrink={0} ml="12px">
          <Image
            alignSelf="center"
            src={Array.isArray(product?.productImages) && product?.productImages[0]?.productImageUrl}
            alt={product?.productName || ""}
            objectFit="cover"
            width="110px"
            height="75px"
            borderRadius="5px"
            backgroundColor="#e4e1e1"
            mb="10px"
            loading="lazy"
            decoding="async"
            opacity={dimmed}
            filter={isOutOfStock ? "grayscale(0.35)" : "none"}
          />
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
          <Box borderRadius="base" alignSelf="center" h="28px" w="70px" bg="white" border="1px solid #D7D7D7" display="flex" alignItems="center" opacity={isOutOfStock ? 0.7 : 1}>
            < Button onClick={ ()=>deleteToCartProduct(product)}   alignSelf="center" bg="white" color="black" h="15px" w="20px" size="xs">-</Button>
            <Spacer />
            <p>{quantity}</p>
            <Spacer />
            < Button onClick={handlePlus} isDisabled={isOutOfStock} alignSelf="center" bg="white" color="black" h="15px" w="20px" size="xs">+</Button>
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
