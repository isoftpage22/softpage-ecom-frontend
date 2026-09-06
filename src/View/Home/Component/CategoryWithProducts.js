"use client";

import { Box, Flex, Image, Spinner, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import ProductCard from '../../../Container/Productcard/Productcard'
import { categoryAnchorId } from './CategoryMenuFab'
import { qtyForProduct } from '../../../../lib/catalog/options'

const CategoryWithProducts = (props) => {
  const {
    productList,
    addToCart,
    addToCartProduct,
    deleteToCartProduct,
    isLoading,
    isSearch,
    searchFailed,
  } = props
  const [productsWithCategories, setProductsWithCategories] = useState(productList?.categories ?? [])

  useEffect(() => {
    setProductsWithCategories(productList?.categories ?? [])
  }, [productList])

  if (isLoading) {
    return (
      <Box bg="white" mb="10px" py="48px" textAlign="center">
        <Spinner size="sm" color="gray.500" mb="12px" />
        <Text color="gray.600">Searching…</Text>
      </Box>
    )
  }

  const emptyCopy = searchFailed
    ? "Couldn't search dishes"
    : isSearch
      ? "No dishes found"
      : "No Products available"

  return (
    <Box bg="white" mb="10px">
      {
       productsWithCategories.length > 0 ?
        productsWithCategories.map((prodCateg) => {
          if (!Array.isArray(prodCateg.products) || prodCateg.products.length === 0) return null
          return (
          <Box key={prodCateg.categoryName} id={categoryAnchorId(prodCateg.categoryName)} scrollMarginTop="72px">
            <Flex align="center" gap="12px" pt="28px" pb="12px" px="6%">
              {/* {prodCateg.categoryImage ? (
                <Image
                  src={prodCateg.categoryImage}
                  alt=""
                  boxSize="56px"
                  minW="56px"
                  borderRadius="12px"
                  objectFit="cover"
                  bg="#eee"
                />
              ) : null} */}
              <Text fontSize="22px" fontWeight="700" lineHeight="28px">
                {prodCateg.categoryName}
              </Text>
            </Flex>
             {
                prodCateg.products.map((product) => {
                  const quantity = qtyForProduct(addToCart?.products, product.id)
                  return <ProductCard
                   quantity={quantity}
                   addToCart={addToCart}
                   addToCartProduct={addToCartProduct}
                   deleteToCartProduct={deleteToCartProduct}
                   key={product.id}
                   product={product}
                    />
               })
             }
          </Box>
          )
        })
        :
         <Text textAlign="center" py="48px" color="gray.600">{emptyCopy}</Text>
      }
    </Box>
  )
}

export default CategoryWithProducts
