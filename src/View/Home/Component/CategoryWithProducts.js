import { Box, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import ProductCard from '../../../Container/Productcard/Productcard'
import { categoryAnchorId } from './CategoryMenuFab'
import { qtyForProduct } from '../../../../lib/catalog/options'

const CategoryWithProducts = (props) => {
  const { productList, addToCart, addToCartProduct, deleteToCartProduct } = props
  const [productsWithCategories, setProductsWithCategories] = useState(productList?.categories ?? [])

  useEffect(() => {
    setProductsWithCategories(productList?.categories ?? [])
  }, [productList])

  return (
    <Box bg="white" mb="10px">
      {
       productsWithCategories.length > 0 ?
        productsWithCategories.map((prodCateg) => {
          if (!Array.isArray(prodCateg.products) || prodCateg.products.length === 0) return null
          return (
          <Box key={prodCateg.categoryName} id={categoryAnchorId(prodCateg.categoryName)} scrollMarginTop="16px">
            <Text fontSize="22px" fontWeight="700" lineHeight="28px" pt="28px" pb="12px" px="6%">
              {prodCateg.categoryName}
            </Text>
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
         <>
          <Text textAlign={"center"}>No Products available</Text>
         </>
      }
    </Box>
  )
}

export default CategoryWithProducts
