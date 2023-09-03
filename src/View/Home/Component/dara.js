import { Box,Text } from '@chakra-ui/layout'
import React from 'react'
import ProductCard from '../../../Container/Productcard/Productcard'

const CategoryWithProducts = (props) => {
  const {productList,addToCart,addToCartProduct,deleteToCartProduct} =props
  // const{products}=productList
const productsWithCategories = productList.categories

  return (
    <>
    {console.log(productList,"productList")}
    <Box bg="white" mb="10px">
      {
        productsWithCategories.map((prodCateg)=>{
          return <>
           <Text fontSize="24px" p="32px 21px 32px 6%">{prodCateg.categoryName}</Text>
             {
                Array.isArray(prodCateg.products) && prodCateg.products.map((product,index)=>{
                  const cartProduct =
                  addToCart &&
                  addToCart.products.filter(
                    (cart) => {
          
                      return (cart.product_id === product.id)
                    }
                  )
                  const quantity = cartProduct[0] ? cartProduct[0].quantity : 0
                  return <ProductCard 
                   quantity={quantity} 
                   addToCart={addToCart} 
                   addToCartProduct={addToCartProduct} 
                   deleteToCartProduct={deleteToCartProduct}
                   key={index} 
                   product = {product}
                   
                    />
         
               })
             }
          </>
        })
        
      }
     
    </Box>
     </>
  )
}

export default CategoryWithProducts
