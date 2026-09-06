"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import CategoryWithProducts from './Component/CategoryWithProducts'
import CurrentOffers from './Component/CurrentOffers'
import ProductPromotions from './Component/ProductPromotions'
import ToggleSwitch from './Component/ToggleSwitch'
import CategoryMenuFab from './Component/CategoryMenuFab'
import CommonTopBar from '../../Layout/Components/CommonTopBar/CommonTopBar'
import Footer from '../../Layout/Guest/Components/Footer'
import { useMenuCatalog } from '../../hooks/useMenuCatalog'
import { useMenuProductSearch } from '../../hooks/useMenuProductSearch'
import { useMenuListingRestore } from '../../hooks/useMenuListingRestore'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { exitTableSessionToWebsite, getTableSession, isDineInSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { Box, Flex, Text } from '@chakra-ui/react'
import { filterVegOnlyCatalog } from '../../../lib/catalog/options'
import { mapCatalogToProductList } from '@/lib/catalog/mapCatalog'
import { peekListingRestore, setListingRestoreLive } from '@/lib/menu/listingRestore'

function categoriesFromProductList(productList) {
  return (productList?.categories || [])
    .filter((category) => category?.categoryId != null)
    .map((category) => ({
      id: category.categoryId,
      name: category.categoryName,
      image: category.categoryImage,
      bannerImage: category.categoryImage,
    }))
}

const Home = (props) => {
  const {
    productList,
    addToCart,
    addToCartProduct,
    deleteToCartProduct,
    emptyOrderPaymentStatuses,
    hideChrome,
    initialCatalog,
    searchQuery: searchQueryProp,
  } = props
  useMenuCatalog(initialCatalog)

  const controlledSearch = !!hideChrome
  const [internalSearch, setInternalSearch] = useState("")
  const [vegOnly, setVegOnly] = useState(false)
  const [filtersReady, setFiltersReady] = useState(false)
  const restoredApiQuery = useRef(null)
  const pendingRestoreRef = useRef(null)

  useLayoutEffect(() => {
    const snap = peekListingRestore()
    pendingRestoreRef.current = snap
    if (snap?.vegOnly) setVegOnly(true)
    if (!controlledSearch && snap?.searchQuery) {
      setInternalSearch(snap.searchQuery)
    }
    if (snap?.searchQuery) restoredApiQuery.current = snap.searchQuery
    setFiltersReady(true)
  }, [controlledSearch])

  const rawSearch = controlledSearch ? (searchQueryProp ?? "") : internalSearch
  const debouncedSearch = useDebouncedValue(rawSearch, 300)

  useEffect(() => {
    if (restoredApiQuery.current && rawSearch !== restoredApiQuery.current) {
      restoredApiQuery.current = null
    }
  }, [rawSearch])

  const searchForApi =
    restoredApiQuery.current && rawSearch === restoredApiQuery.current
      ? restoredApiQuery.current
      : debouncedSearch

  const search = useMenuProductSearch(searchForApi)

  useEffect(() => {
    setListingRestoreLive({
      vegOnly,
      ...(controlledSearch ? {} : { searchQuery: internalSearch }),
    })
  }, [vegOnly, controlledSearch, internalSearch])

  useEffect(() => {
    emptyOrderPaymentStatuses()
  }, [emptyOrderPaymentStatuses])

  const [tableSession, setTableSessionState] = useState(null)
  useEffect(() => {
    setTableSessionState(getTableSession())
  }, [])
  const dineIn = isDineInSession(tableSession)
  const tableLabel = tableSessionLabel(tableSession)

  const searchedList = useMemo(
    () => mapCatalogToProductList(search.items || [], categoriesFromProductList(productList)),
    [search.items, productList],
  )

  const sourceList = search.active
    ? (search.isPending ? { categories: [] } : searchedList)
    : productList

  const visibleProductList = useMemo(
    () => filterVegOnlyCatalog(sourceList, vegOnly),
    [sourceList, vegOnly],
  )

  const typedSearch = String(rawSearch || "").trim()
  const awaitingSearch =
    typedSearch.length >= 2 && String(searchForApi || "").trim() !== typedSearch
  const showSearchLoading = search.isPending || awaitingSearch

  const pendingSearch = String(pendingRestoreRef.current?.searchQuery || "").trim()
  const searchMatches = !pendingSearch || typedSearch === pendingSearch
  const debounceCaughtUp =
    !pendingSearch || String(searchForApi || "").trim() === pendingSearch
  const ready =
    filtersReady &&
    searchMatches &&
    debounceCaughtUp &&
    !awaitingSearch &&
    (!search.active || !search.isPending)

  useMenuListingRestore(ready)

  const searching = typedSearch.length > 0

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
      {!hideChrome && (
        <CommonTopBar searchQuery={internalSearch} onSearchChange={setInternalSearch} />
      )}
      {!hideChrome && !searching && <ProductPromotions initialCatalog={initialCatalog} />}
      {!hideChrome && !searching && <CurrentOffers />}
      <ToggleSwitch vegOnly={vegOnly} onVegOnlyChange={setVegOnly} />
      <CategoryWithProducts
        productList={visibleProductList}
        addToCart={addToCart}
        addToCartProduct={addToCartProduct}
        deleteToCartProduct={deleteToCartProduct}
        isLoading={showSearchLoading}
        isSearch={search.active}
        searchFailed={search.isError && !search.items?.length}
      />
      {!hideChrome && <Footer {...props} />}
      <CategoryMenuFab
        productList={showSearchLoading ? { categories: [] } : visibleProductList}
        cartItemCount={addToCart?.products?.length || 0}
      />
    </>
  )
}

export default Home
