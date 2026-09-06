"use client";

import React, { useEffect, useMemo, useState } from 'react'
import CategoryWithProducts from './Component/CategoryWithProducts'
import CurrentOffers from './Component/CurrentOffers'
import ProductPromotions from './Component/ProductPromotions'
import ToggleSwitch from './Component/ToggleSwitch'
import CategoryMenuFab from './Component/CategoryMenuFab'
import CommonTopBar from '../../Layout/Components/CommonTopBar/CommonTopBar'
import Footer from '../../Layout/Guest/Components/Footer'
import { useMenuCatalog } from '../../hooks/useMenuCatalog'
import { exitTableSessionToWebsite, getTableSession, isDineInSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { Box, Flex, Text } from '@chakra-ui/react'
import { filterVegOnlyCatalog } from '../../../lib/catalog/options'

const Home = (props) => {
  const { productList, addToCart, addToCartProduct, deleteToCartProduct, toggleUserFormDrawer, usersAddress, emptyOrderPaymentStatuses, hideChrome, initialCatalog } = props
  useMenuCatalog(initialCatalog)
  const [vegOnly, setVegOnly] = useState(false)

  useEffect(() => {
    emptyOrderPaymentStatuses()
  }, [emptyOrderPaymentStatuses])

  const [tableSession, setTableSessionState] = useState(null)
  useEffect(() => {
    setTableSessionState(getTableSession())
  }, [])
  const dineIn = isDineInSession(tableSession)
  const tableLabel = tableSessionLabel(tableSession)
  const visibleProductList = useMemo(
    () => filterVegOnlyCatalog(productList, vegOnly),
    [productList, vegOnly]
  )

  return (
    <>
      {dineIn && tableLabel ? (
        <Box bg="var(--brand-secondary, #111)" color="white" px="16px" py="8px">
          <Flex align="center" justify="space-between" gap="12px">
            <Text fontSize="13px" fontWeight="600" noOfLines={1}>{tableLabel}</Text>
            <Text
              as="button"
              type="button"
              fontSize="12px"
              fontWeight="700"
              textDecoration="underline"
              textUnderlineOffset="2px"
              flexShrink={0}
              onClick={() => exitTableSessionToWebsite()}
            >
              Order online
            </Text>
          </Flex>
        </Box>
      ) : null}
      {!hideChrome && <CommonTopBar />}
      {!hideChrome && <ProductPromotions initialCatalog={initialCatalog} />}
      {!hideChrome && <CurrentOffers />}
      <ToggleSwitch vegOnly={vegOnly} onVegOnlyChange={setVegOnly} />
      <CategoryWithProducts
        productList={visibleProductList}
        addToCart={addToCart}
        addToCartProduct={addToCartProduct}
        deleteToCartProduct={deleteToCartProduct}
      />
      {!hideChrome && <Footer {...props} />}
      <CategoryMenuFab
        productList={visibleProductList}
        cartItemCount={addToCart?.products?.length || 0}
      />
    </>
  )
}

export default Home
