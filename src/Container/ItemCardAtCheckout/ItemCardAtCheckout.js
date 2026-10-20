import { Flex, Box, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Card from '../../Components/Card/Card'
import { ChevronDownIcon } from '@chakra-ui/icons'
import VegMarker from '../../Components/VegMarker/VegMarker'
import QtyStepper from '../../Components/QtyStepper/QtyStepper'
import ProductCustomizationDrawer from '../ProductCustomizationDrawer/ProductCustomizationDrawer'
import ChooseLastItemDrawer from '../ChooseLastItemDrawer/ChooseLastItemDrawer'
import {
  productHasOptions,
  cartPayloadFromSelection,
  cartPayloadFromLine,
  isProductOutOfStock,
  isVariantOutOfStock,
} from '../../../lib/catalog/options'
import { lineMatchesItemNames } from '../../../lib/api/userFacingError'

const ItemCardAtCheckout = (props) => {
  const { product: line, addToCartProduct, deleteToCartProduct, quantity } = props
  const catalogProduct = line?.product
  const hasOptions = productHasOptions(catalogProduct)
  const customization = line?.customizationLabel
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [repeatOpen, setRepeatOpen] = useState(false)
  const checkoutError = useSelector((state) => state.shoppingCart.checkoutError)
  const selectedVariant = (catalogProduct?.variants || []).find(
    (variant) => String(variant.id) === String(line?.variantId)
  )
  const isUnavailable =
    isProductOutOfStock(catalogProduct) ||
    isVariantOutOfStock(selectedVariant, catalogProduct) ||
    lineMatchesItemNames(line, checkoutError?.itemNames || [])
  const dimmed = isUnavailable ? 0.42 : 1

  const handleMinus = () => {
    deleteToCartProduct({ id: line.product_id, lineKey: line.lineKey })
  }

  const handlePlus = () => {
    if (isUnavailable) return
    if (hasOptions) {
      setRepeatOpen(true)
      return
    }
    addToCartProduct(cartPayloadFromLine(catalogProduct, line))
  }

  const openCustomization = (event) => {
    event?.stopPropagation?.()
    if (!hasOptions) return
    setOptionsOpen(true)
  }

  return (
    <>
      <Card
        alignItems="flex-start"
        gap="10px"
        w="100%"
        bg={isUnavailable ? "#F7F7F7" : "white"}
        borderLeft={isUnavailable ? "3px solid #C53030" : "3px solid transparent"}
      >
        <Box mt="3px" flexShrink={0} opacity={dimmed}>
          <VegMarker isVeg={!!catalogProduct?.isVeg} />
        </Box>
        <Flex direction="column" flex="1" minW="0" opacity={dimmed}>
          <Text variant="solidCart" noOfLines={2} wordBreak="break-word">{line?.productName}</Text>
          {isUnavailable ? (
            <Text fontSize="11px" fontWeight="700" color="#C53030" pt="2px">
              Out of stock
            </Text>
          ) : null}
          {hasOptions ? (
            <Box as="button" type="button" textAlign="left" mt="4px" onClick={openCustomization} cursor="pointer">
              <Flex align="center" gap="2px">
                <Text p="0px" size="xs" fontSize="12px" variant="mutedCart">
                  CUSTOMIZED
                </Text>
                <ChevronDownIcon size="sm" />
              </Flex>
              {customization ? (
                <Text fontSize="12px" color="gray.600" noOfLines={2}>
                  {customization}
                </Text>
              ) : null}
            </Box>
          ) : customization ? (
            <Text variant="solidCart" fontSize="12px" noOfLines={2}>
              ({customization})
            </Text>
          ) : null}
        </Flex>
        <Flex direction="column" align="flex-end" gap="6px" flexShrink={0}>
          <Box opacity={isUnavailable ? 0.7 : 1}>
            <QtyStepper
              quantity={quantity}
              onDecrement={handleMinus}
              onIncrement={handlePlus}
              incrementDisabled={isUnavailable}
            />
          </Box>
          <Text variant="solidCart" fontWeight="700" opacity={dimmed} whiteSpace="nowrap">₹{line?.total_amount}</Text>
        </Flex>
      </Card>
      <ProductCustomizationDrawer
        product={catalogProduct}
        isOpen={optionsOpen}
        initialSelection={{
          variantId: line?.variantId,
          addons: line?.addons || [],
          comboSelections: line?.comboSelections || [],
          quantity,
        }}
        onClose={() => setOptionsOpen(false)}
        onConfirm={(selection) => {
          addToCartProduct({
            ...cartPayloadFromSelection(catalogProduct, selection),
            replaceLineKey: line.lineKey,
          })
          setOptionsOpen(false)
        }}
      />
      <ChooseLastItemDrawer
        isOpen={repeatOpen}
        onClose={() => setRepeatOpen(false)}
        onRepeat={() => {
          setRepeatOpen(false)
          addToCartProduct(cartPayloadFromLine(catalogProduct, line))
        }}
        onChoose={() => {
          setRepeatOpen(false)
          setOptionsOpen(true)
        }}
      />
    </>
  )
}

export default ItemCardAtCheckout
