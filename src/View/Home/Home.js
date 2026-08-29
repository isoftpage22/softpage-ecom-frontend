import React, { useEffect, useMemo, useState } from 'react'
import CategoryWithProducts from './Component/CategoryWithProducts'
import CurrentOffers from './Component/CurrentOffers'
import ProductPromotions from './Component/ProductPromotions'
import ToggleSwitch from './Component/ToggleSwitch'
import CategoryMenuFab from './Component/CategoryMenuFab'
import CommonTopBar from '../../Layout/Components/CommonTopBar/CommonTopBar'
import Footer from '../../Layout/Guest/Components/Footer'
import { useMenuCatalog } from '../../hooks/useMenuCatalog'
import { getTableSession, isDineInSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { Box, Text } from '@chakra-ui/react'
import { filterVegOnlyCatalog } from '../../../lib/catalog/options'

const Home = (props) => {
  const { productList, addToCart, addToCartProduct, deleteToCartProduct, toggleUserFormDrawer, usersAddress, emptyOrderPaymentStatuses, hideChrome } = props
  useMenuCatalog()
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
          <Text fontSize="13px" fontWeight="600">{tableLabel}</Text>
        </Box>
      ) : null}
      {!hideChrome && <CommonTopBar />}
      {!hideChrome && <ProductPromotions />}
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
