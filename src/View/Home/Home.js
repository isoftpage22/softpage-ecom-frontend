import React,{useEffect} from 'react'
import ItemCardAtCheckout from '../../Container/ItemCardAtCheckout/ItemCardAtCheckout'
import CategoryWithProducts from './Component/CategoryWithProducts'
import CurrentOffers from './Component/CurrentOffers'
import ProductPromotions from './Component/ProductPromotions'
import ToggleSwitch from './Component/ToggleSwitch'
import { Box } from '@chakra-ui/layout';


const Home = (props) => {
  const {getProductsList,productList,addToCart,addToCartProduct,deleteToCartProduct} =props
   useEffect(() => {
    getProductsList()
   }, [])
  return (
   <>
   <ProductPromotions/>
   <CurrentOffers/>
   <ToggleSwitch/>
    <CategoryWithProducts 
     productList={productList} 
     addToCart={addToCart}
     addToCartProduct={addToCartProduct}
     deleteToCartProduct={deleteToCartProduct}
     />
   </>
  )
}

export default Home
