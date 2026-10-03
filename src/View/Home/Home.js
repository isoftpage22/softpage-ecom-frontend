"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import CategoryWithProducts from './Component/CategoryWithProducts'
import CurrentOffers from './Component/CurrentOffers'
import ProductPromotions from './Component/ProductPromotions'
import ToggleSwitch from './Component/ToggleSwitch'
import CategoryMenuFab from './Component/CategoryMenuFab'
import { DesktopCartRail, DesktopCategoryNav } from './Component/DesktopMenu'
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

function orderGuestList(list, ids, strategy) {
  const index = new Map((ids || []).map((id, position) => [String(id), position]))
  const categories = (list?.categories || [])
    .map((category) => ({
      ...category,
      products: (category.products || [])
        .filter((product) => index.has(String(product.id)))
        .sort((a, b) => index.get(String(a.id)) - index.get(String(b.id))),
    }))
    .filter((category) => category.products.length)
  if (strategy === 'nameList') {
    const products = []
    const seen = new Set()
    for (const id of ids || []) {
      for (const category of categories) {
        const found = category.products.find((product) => String(product.id) === String(id))
        if (found && !seen.has(String(found.id))) {
          products.push(found)
          seen.add(String(found.id))
        }
      }
    }
    return { categories: products.length ? [{ categoryId: 'menu', categoryName: 'Menu', categoryImage: '', products }] : [] }
  }
  const ordered = strategy === 'nameAsc' || strategy === 'nameDesc'
    ? categories.slice().sort((a, b) => String(a.categoryName || '').localeCompare(String(b.categoryName || '')) * (strategy === 'nameDesc' ? -1 : 1))
    : categories
  return { ...list, categories: ordered }
}

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
    reserveLook,
    boundProductIds,
    arrangedMenu,
    arrangedProducts,
    menuStrategy,
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

  const arrangedList = useMemo(() => {
    if (!Array.isArray(arrangedMenu)) return null
    const byId = new Map()
    const images = new Map()
    for (const category of productList?.categories || []) {
      if (category?.categoryId != null) images.set(String(category.categoryId), category.categoryImage || '')
      for (const product of category.products || []) {
        if (product?.id == null) continue
        byId.set(String(product.id), product)
      }
    }
    for (const item of arrangedProducts || []) {
      if (item?.id == null || byId.has(String(item.id))) continue
      const price = Number(item.price) || 0
      byId.set(String(item.id), {
        id: item.id,
        slug: item.slug || null,
        productName: item.name || item.productName || '',
        productDesc: item.metaDescription || item.description || '',
        price,
        productCost: price,
        productImages: item.image ? [{ productImageUrl: item.image, altText: item.name || '' }] : [],
        categoryId: item.categoryId,
        isVeg: item.isVeg === true || item.isVeg === 1,
        tags: Array.isArray(item.tags) ? item.tags : [],
      })
    }
    if (search.active && search.isPending) return { categories: [] }
    const allowed = search.active ? new Set((search.items || []).map((item) => String(item.id))) : null
    return {
      categories: arrangedMenu
        .map((group) => {
          const ranked = group.sort && group.sort !== 'manual'
            ? (arrangedProducts || []).filter((item) => String(item.categoryId) === String(group.categoryId)).map((item) => String(item.id))
            : []
          const order = ranked.length ? ranked : (group.productIds || [])
          return {
          categoryId: group.categoryId,
          categoryName: group.name,
          categoryImage: images.get(String(group.categoryId)) || '',
          products: order
            .map((id) => byId.get(String(id)))
            .filter((product) => product && (!allowed || allowed.has(String(product.id)))),
          }
        })
        .filter((category) => category.products.length),
    }
  }, [arrangedMenu, arrangedProducts, productList, search.active, search.isPending, search.items])

  const boundList = useMemo(() => {
    if (arrangedList) return arrangedList
    if (search.active || !Array.isArray(boundProductIds) || !boundProductIds.length) return sourceList
    return orderGuestList(sourceList, boundProductIds, menuStrategy)
  }, [arrangedList, sourceList, boundProductIds, search.active, menuStrategy])

  const visibleProductList = useMemo(
    () => filterVegOnlyCatalog(boundList, vegOnly),
    [boundList, vegOnly],
  )

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''
    if (!hash.startsWith('menu-cat-') || !visibleProductList?.categories?.length) return
    const frame = requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [visibleProductList])

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
      <Flex align="flex-start" w="100%">
        <DesktopCategoryNav productList={showSearchLoading ? { categories: [] } : visibleProductList} isSearch={search.active} />
        <Box flex="1" minW={0}>
          {search.active ? (
            <Text px={{ base: "6%", lg: "16px" }} pt="16px" fontSize="14px" color="gray.600">
              {typedSearch ? `Dishes matching “${typedSearch}”` : "Search results"}
            </Text>
          ) : null}
          <ToggleSwitch vegOnly={vegOnly} onVegOnlyChange={setVegOnly} reserveLook={reserveLook} liftReserve={(addToCart?.products?.length || 0) > 0} />
          <CategoryWithProducts
            productList={visibleProductList}
            addToCart={addToCart}
            addToCartProduct={addToCartProduct}
            deleteToCartProduct={deleteToCartProduct}
            isLoading={showSearchLoading}
            isSearch={search.active}
            searchFailed={search.isError && !search.items?.length}
          />
        </Box>
        <DesktopCartRail />
      </Flex>
      {!hideChrome && <Footer {...props} />}
      <CategoryMenuFab
        productList={showSearchLoading ? { categories: [] } : visibleProductList}
        cartItemCount={addToCart?.products?.length || 0}
      />
    </>
  )
}

export default Home
