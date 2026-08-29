import { Box, Flex, Text, Drawer, DrawerOverlay, DrawerContent, DrawerBody } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { showsOrderBar } from '@/lib/cart/persistCart'

export function categoryAnchorId(name) {
  return `menu-cat-${String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`
}

const CategoryMenuFab = ({ productList, cartItemCount = 0 }) => {
  const [open, setOpen] = useState(false)
  const activeOrder = useSelector((state) => state.shoppingCart.activeOrder)
  const liftForBar = cartItemCount > 0 || showsOrderBar(activeOrder)
  const categories = useMemo(
    () =>
      (productList?.categories || []).filter(
        (category) => Array.isArray(category.products) && category.products.length > 0
      ),
    [productList]
  )

  if (categories.length === 0) return null

  const jumpTo = (name) => {
    setOpen(false)
    const el = document.getElementById(categoryAnchorId(name))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <Flex
        as="button"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
        position="fixed"
        right="16px"
        bottom={liftForBar ? '80px' : '24px'}
        zIndex={1100}
        direction="column"
        align="center"
        justify="center"
        w="64px"
        h="64px"
        bg="brand.700"
        color="white"
        borderRadius="12px"
        boxShadow="0 4px 16px rgba(0,0,0,0.28)"
        cursor="pointer"
        border="none"
      >
        {open ? (
          <>
            <CloseIcon boxSize="12px" mb="6px" />
            <Text fontSize="10px" fontWeight="700" letterSpacing="0.4px" color="white" lineHeight="1">
              CLOSE
            </Text>
          </>
        ) : (
          <>
            <Box mb="6px" display="grid" gridTemplateColumns="repeat(2, 8px)" gap="3px">
              {[0, 1, 2, 3].map((i) => (
                <Box key={i} w="8px" h="8px" bg="white" borderRadius="1px" />
              ))}
            </Box>
            <Text fontSize="10px" fontWeight="700" letterSpacing="0.4px" color="white" lineHeight="1">
              MENU
            </Text>
          </>
        )}
      </Flex>

      <Drawer placement="bottom" isOpen={open} onClose={() => setOpen(false)}>
        <DrawerOverlay />
        <DrawerContent borderTopRadius="16px" maxH="70vh">
          <DrawerBody px="0" pt="8px" pb="88px">
            <Box w="40px" h="4px" bg="#DAD9D9" borderRadius="full" mx="auto" mb="12px" />
            <Text px="6%" fontSize="18px" fontWeight="700" mb="4px">
              Menu
            </Text>
            {categories.map((category) => (
              <Flex
                key={category.categoryName}
                as="button"
                type="button"
                w="100%"
                px="6%"
                py="14px"
                justify="space-between"
                align="center"
                borderBottom="1px solid #EEE"
                onClick={() => jumpTo(category.categoryName)}
                bg="white"
              >
                <Text fontSize="15px" fontWeight="600" textAlign="left">
                  {category.categoryName}
                </Text>
                <Text fontSize="13px" color="#787676">
                  {category.products.length}
                </Text>
              </Flex>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default CategoryMenuFab
