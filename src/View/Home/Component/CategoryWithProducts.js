import { Box,Text } from '@chakra-ui/layout'
import React from 'react'
import ProductCard from '../../../Container/Productcard/Productcard'

const CategoryWithProducts = (props) => {
  const {productList} =props
  const{products}=productList
  console.log("productListData",productList)

  return (
    <>
     <Box >
    <Box bg="white" mb="10px">
      <Text fontSize="24px" p="32px 21px 32px 6%">BTS Meal</Text>
      {Array.isArray(products) &&products.map((product,index)=>{
         return <ProductCard key={index} product = {product}/>

      })}
      {/* <ProductCard/>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/> */}
    </Box>
    <Box bg="white" mb="10px">
      <Text fontSize="24px" p="32px 21px 32px 6%">Veg Meal</Text>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
    </Box>
    <Box bg="white" mb="10px">
      <Text fontSize="24px" p="32px 21px 32px 6%">Veg Meal</Text>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
    </Box>
    </Box>
    </>
  )
}

export default CategoryWithProducts
