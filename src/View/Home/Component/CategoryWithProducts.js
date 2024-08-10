import { Box,Text } from '@chakra-ui/layout'
import React,{useEffect, useState} from 'react'
import ProductCard from '../../../Container/Productcard/Productcard'

const CategoryWithProducts = (props) => {
  const {productList,addToCart,addToCartProduct,deleteToCartProduct} =props
  const [productsWithCategories, setProductsWithCategories] = useState(productList?.categories??[])
  // const{products}=productList
  useEffect(() => {
     {console.log("productList tender time")}
    setProductsWithCategories(productList?.categories??[])
  }, [productList])
  
  return (
    <>
    {console.log(productList,"productList",productsWithCategories)}
    <Box bg="white" mb="10px">
      {
       productsWithCategories.length >0 ? 
        productsWithCategories.map((prodCateg)=>{
          return <>
          { prodCateg.products.length>0 && <Text fontSize="24px" p="32px 21px 32px 6%">{prodCateg.categoryName}</Text> }
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
        :
         <>
          <Text textAlign={"center"}>No Products available</Text>
         </> 
      }
     
    </Box>
     </>
  )
}

export default CategoryWithProducts
