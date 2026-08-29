import React, { useEffect, useMemo, useState } from "react"
import {
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Flex,
  Box,
  Text,
  Button,
} from "@chakra-ui/react"
import { ArrowBackIcon } from "@chakra-ui/icons"
import DrawerComp from "../../Components/DrawerComp/DrawerComp"
import VegMarker from "../../Components/VegMarker/VegMarker"
import { defaultAddonSelections, variantUnitPrice, isProductOutOfStock, isVariantOutOfStock } from "../../../lib/catalog/options"

const money = (n) => `₹${Math.round(Number(n) || 0)}`

const selectionHint = (group) =>
  group.minSelections === group.maxSelections
    ? `Choose ${group.maxSelections}`
    : group.maxSelections >= 99
      ? `Choose ${Math.max(group.minSelections, 0)}+`
      : `Choose ${group.minSelections}–${group.maxSelections}`

const ProductCustomizationDrawer = ({ product, isOpen, onClose, onConfirm, initialSelection = null }) => {
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [selectedCombos, setSelectedCombos] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [attempted, setAttempted] = useState(false)

  const addonGroups = product?.addonGroups || []
  const comboGroups = product?.comboGroups || []
  const variants = product?.variants || []

  useEffect(() => {
    if (!isOpen || !product) return
    const initialVariant = initialSelection?.variantId
      ? variants.find((variant) => String(variant.id) === String(initialSelection.variantId))
      : null
    setSelectedVariant(initialVariant || (variants.length === 1 ? variants[0] : null))
    setSelectedAddons(
      Array.isArray(initialSelection?.addons)
        ? initialSelection.addons
        : defaultAddonSelections(addonGroups)
    )
    if (Array.isArray(initialSelection?.comboSelections) && initialSelection.comboSelections.length > 0) {
      setSelectedCombos(initialSelection.comboSelections)
    } else {
      const defaults = []
      comboGroups.forEach((group) => {
        (group.components || []).forEach((comp) => {
          if (!comp.isDefault) return
          defaults.push({
            groupId: group.id,
            groupName: group.name,
            componentId: comp.id,
            componentItemId: comp.componentItemId,
            componentName: comp.name,
            variantId: comp.componentVariantId ?? undefined,
            quantity: comp.quantity || 1,
            priceDelta: comp.priceDelta || 0,
          })
        })
      })
      setSelectedCombos(defaults)
    }
    setQuantity(Math.max(1, Number(initialSelection?.quantity) || 1))
    setAttempted(false)
  }, [isOpen, product?.id, initialSelection?.variantId, initialSelection?.quantity])

  const toggleAddon = (group, optionId) => {
    const option = (group.options || []).find((item) => item.id === optionId)
    if (!option) return
    setSelectedAddons((prev) => {
      const inGroup = prev.filter((addon) => addon.groupId === group.id)
      const exists = inGroup.some((addon) => addon.optionId === optionId)
      if (exists) {
        return prev.filter((addon) => !(addon.groupId === group.id && addon.optionId === optionId))
      }
      const entry = {
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionName: option.name,
        price: Number(option.price) || 0,
      }
      if (group.maxSelections === 1) {
        return [...prev.filter((addon) => addon.groupId !== group.id), entry]
      }
      if (inGroup.length >= group.maxSelections) return prev
      return [...prev, entry]
    })
  }

  const toggleCombo = (group, componentId) => {
    const comp = (group.components || []).find((item) => item.id === componentId)
    if (!comp) return
    setSelectedCombos((prev) => {
      const inGroup = prev.filter((combo) => combo.groupId === group.id)
      const exists = inGroup.some((combo) => combo.componentId === componentId)
      if (exists) {
        return prev.filter((combo) => !(combo.groupId === group.id && combo.componentId === componentId))
      }
      const entry = {
        groupId: group.id,
        groupName: group.name,
        componentId: comp.id,
        componentItemId: comp.componentItemId,
        componentName: comp.name,
        variantId: comp.componentVariantId ?? undefined,
        quantity: comp.quantity || 1,
        priceDelta: Number(comp.priceDelta) || 0,
      }
      if (group.maxSelections === 1) {
        return [...prev.filter((combo) => combo.groupId !== group.id), entry]
      }
      if (inGroup.length >= group.maxSelections) return prev
      return [...prev, entry]
    })
  }

  const basePrice = variantUnitPrice(product, selectedVariant)
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
  const comboPrice = selectedCombos.reduce(
    (sum, combo) => sum + Number(combo.priceDelta || 0) * Number(combo.quantity || 1),
    0
  )
  const unitPrice = basePrice + addonsPrice + comboPrice
  const totalPrice = unitPrice * quantity

  const groupErrors = useMemo(() => {
    const errors = {}
    if (variants.length > 0 && !selectedVariant) {
      errors.__variant = "Please choose an option"
    }
    addonGroups.forEach((group) => {
      if (group.isRequired || group.minSelections > 0) {
        const count = selectedAddons.filter((addon) => addon.groupId === group.id).length
        if (count < group.minSelections || (group.isRequired && count === 0)) {
          errors[group.id] = `Select at least ${Math.max(group.minSelections, 1)}`
        }
      }
    })
    comboGroups.forEach((group) => {
      if (group.isRequired || group.minSelections > 0) {
        const count = selectedCombos.filter((combo) => combo.groupId === group.id).length
        if (count < group.minSelections || (group.isRequired && count === 0)) {
          errors[`combo-${group.id}`] = `Select at least ${Math.max(group.minSelections, 1)}`
        }
      }
    })
    return errors
  }, [variants.length, selectedVariant, addonGroups, comboGroups, selectedAddons, selectedCombos])

  const isValid = Object.keys(groupErrors).length === 0
  const productOutOfStock = isProductOutOfStock(product)
  const selectedVariantOutOfStock = isVariantOutOfStock(selectedVariant, product)
  const cannotAdd = productOutOfStock || selectedVariantOutOfStock

  const handleConfirm = () => {
    setAttempted(true)
    if (!isValid || !product || cannotAdd) return
    onConfirm({
      variant: selectedVariant,
      addons: selectedAddons,
      comboSelections: selectedCombos,
      quantity,
      unitPrice,
    })
  }

  const optionRow = ({ checked, onToggle, name, extra, disabled }) => (
    <Flex
      as="button"
      type="button"
      onClick={disabled ? undefined : onToggle}
      w="100%"
      align="center"
      justify="space-between"
      py="12px"
      px="4px"
      borderBottom="1px solid #F0F0F0"
      bg="white"
      opacity={disabled ? 0.4 : 1}
      cursor={disabled ? "not-allowed" : "pointer"}
    >
      <Flex align="center" gap="10px">
        <Box
          w="16px"
          h="16px"
          borderRadius="full"
          border="2px solid"
          borderColor={checked ? "#1B7A3D" : "#C4C4C4"}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {checked ? <Box w="8px" h="8px" borderRadius="full" bg="#1B7A3D" /> : null}
        </Box>
        <Text fontSize="14px" fontWeight="600" color="gray.700" textAlign="left">
          {name}
        </Text>
      </Flex>
      {extra ? (
        <Text fontSize="13px" color="#787676">
          {extra}
        </Text>
      ) : null}
    </Flex>
  )

  return (
    <DrawerComp
      placement="bottom"
      bg="black"
      height="85vh"
      borderTopRightRadius="30px"
      borderTopLeftRadius="30px"
      toggleDrawer={!!isOpen}
      onClose={onClose}
    >
      <DrawerHeader
        bg="#444"
        flexShrink={0}
        borderTopRightRadius="30px"
        borderTopLeftRadius="30px"
        borderBottomWidth="1px"
        py="12px"
        px="16px"
      >
        <Flex direction="column">
          <Flex align="center">
            <ArrowBackIcon w="20px" color="white" cursor="pointer" onClick={onClose} />
            <Text ml="10px" color="white" lineHeight="19px" fontSize="16px" fontWeight="bold" noOfLines={1}>
              {product?.productName}
            </Text>
            <Box ml="10px">
              <VegMarker isVeg={!!product?.isVeg} />
            </Box>
          </Flex>
          <Text ml="30px" mt="6px" fontSize="14px" lineHeight="17px" color="white">
            {money(unitPrice)}
          </Text>
        </Flex>
      </DrawerHeader>
      <DrawerBody
        bg="white"
        px="6%"
        flex="1"
        minH="0"
        overflowY="auto"
        opacity={productOutOfStock ? 0.42 : 1}
        pointerEvents={productOutOfStock ? "none" : "auto"}
      >
        {variants.length > 0 ? (
          <Box mb="20px" pt="8px">
            <Flex align="center" gap="8px" mb="4px">
              <Text fontWeight="extrabold" fontSize="14px">
                Options
              </Text>
              <Text fontSize="11px" color="#787676">
                Required
              </Text>
            </Flex>
            {attempted && groupErrors.__variant ? (
              <Text fontSize="12px" color="red.500" mb="4px">
                {groupErrors.__variant}
              </Text>
            ) : null}
            {variants.map((variant) => {
              const extra = Number(variant.price) > 0 ? money(variant.price) : null
              const variantSoldOut = isVariantOutOfStock(variant, product)
              return (
                <Box key={variant.id}>
                  {optionRow({
                    checked: selectedVariant?.id === variant.id,
                    onToggle: () => setSelectedVariant(variant),
                    name: variant.name || "Regular",
                    extra: variantSoldOut ? "Sold out" : extra,
                    disabled: variantSoldOut,
                  })}
                </Box>
              )
            })}
          </Box>
        ) : null}

        {comboGroups.map((group) => (
          <Box key={group.id} mb="20px">
            <Flex align="center" gap="8px" flexWrap="wrap" mb="4px">
              <Text fontWeight="extrabold" fontSize="14px">
                {group.name}
              </Text>
              {group.isRequired ? (
                <Text fontSize="11px" color="#787676">
                  Required
                </Text>
              ) : null}
              <Text fontSize="11px" color="#787676">
                {selectionHint(group)}
              </Text>
            </Flex>
            {attempted && groupErrors[`combo-${group.id}`] ? (
              <Text fontSize="12px" color="red.500" mb="4px">
                {groupErrors[`combo-${group.id}`]}
              </Text>
            ) : null}
            {(group.components || []).map((comp) => (
              <Box key={comp.id}>
                {optionRow({
                  checked: selectedCombos.some(
                    (combo) => combo.groupId === group.id && combo.componentId === comp.id
                  ),
                  onToggle: () => toggleCombo(group, comp.id),
                  name: comp.name,
                  extra: Number(comp.priceDelta) > 0 ? `+${money(comp.priceDelta)}` : null,
                })}
              </Box>
            ))}
          </Box>
        ))}

        {addonGroups.map((group) => (
          <Box key={group.id} mb="20px">
            <Flex align="center" gap="8px" flexWrap="wrap" mb="4px">
              <Text fontWeight="extrabold" fontSize="14px">
                {group.name}
              </Text>
              {group.isRequired ? (
                <Text fontSize="11px" color="#787676">
                  Required
                </Text>
              ) : null}
              <Text fontSize="11px" color="#787676">
                {selectionHint(group)}
              </Text>
            </Flex>
            {attempted && groupErrors[group.id] ? (
              <Text fontSize="12px" color="red.500" mb="4px">
                {groupErrors[group.id]}
              </Text>
            ) : null}
            {(group.options || []).map((option) => (
              <Box key={option.id}>
                {optionRow({
                  checked: selectedAddons.some(
                    (addon) => addon.groupId === group.id && addon.optionId === option.id
                  ),
                  onToggle: () => toggleAddon(group, option.id),
                  name: option.name,
                  extra: Number(option.price) > 0 ? `+${money(option.price)}` : null,
                })}
              </Box>
            ))}
          </Box>
        ))}
      </DrawerBody>
      <DrawerFooter
        bg="white"
        borderTop="1px solid #EDEDED"
        boxShadow="0 -8px 24px rgba(0,0,0,0.06)"
        flexShrink={0}
        flexDirection="column"
        alignItems="stretch"
        gap="10px"
        px="16px"
        pt="12px"
        pb="calc(16px + env(safe-area-inset-bottom))"
        zIndex={2}
      >
        <Flex w="100%" align="center" justify="space-between">
          <Text fontSize="13px" fontWeight="600" color="#555" letterSpacing="0" textTransform="none">
            Quantity
          </Text>
          <Flex
            align="center"
            h="40px"
            bg="white"
            border="1.5px solid #111"
            borderRadius="10px"
            overflow="hidden"
            opacity={cannotAdd ? 0.45 : 1}
          >
            <Box
              as="button"
              type="button"
              aria-label="Decrease quantity"
              w="40px"
              h="40px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="20px"
              lineHeight="1"
              fontWeight="600"
              color={cannotAdd || quantity <= 1 ? "#B0B0B0" : "#111"}
              bg="transparent"
              border="none"
              cursor={cannotAdd || quantity <= 1 ? "not-allowed" : "pointer"}
              disabled={cannotAdd || quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              −
            </Box>
            <Text minW="32px" textAlign="center" fontSize="15px" fontWeight="700" color="#111" lineHeight="1">
              {quantity}
            </Text>
            <Box
              as="button"
              type="button"
              aria-label="Increase quantity"
              w="40px"
              h="40px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="20px"
              lineHeight="1"
              fontWeight="600"
              color={cannotAdd ? "#B0B0B0" : "#111"}
              bg="transparent"
              border="none"
              cursor={cannotAdd ? "not-allowed" : "pointer"}
              disabled={cannotAdd}
              onClick={() => setQuantity((value) => value + 1)}
            >
              +
            </Box>
          </Flex>
        </Flex>
        <Button
          colorScheme="none"
          w="100%"
          h="48px"
          minH="48px"
          px="16px"
          py="0"
          bg="#111"
          color="white"
          borderRadius="12px"
          fontSize="15px"
          fontWeight="700"
          textTransform="none"
          letterSpacing="0"
          onClick={handleConfirm}
          isDisabled={cannotAdd}
          _hover={{ bg: "#111" }}
          _active={{ bg: "#000" }}
          _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
        >
          {cannotAdd ? (
            "Sold out"
          ) : (
            <Flex w="100%" align="center" justify="space-between">
              <Text as="span" fontSize="15px" fontWeight="700" color="white" letterSpacing="0" textTransform="none">
                {initialSelection ? "Update item" : "Add to cart"}
              </Text>
              <Text as="span" fontSize="15px" fontWeight="700" color="white" letterSpacing="0" textTransform="none">
                {money(totalPrice)}
              </Text>
            </Flex>
          )}
        </Button>
      </DrawerFooter>
    </DrawerComp>
  )
}

export default ProductCustomizationDrawer
