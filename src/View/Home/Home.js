import React from 'react'
import ItemCardAtCheckout from '../../Container/ItemCardAtCheckout/ItemCardAtCheckout'
import CategoryWithProducts from './Component/CategoryWithProducts'
import CurrentOffers from './Component/CurrentOffers'
import ProductPromotions from './Component/ProductPromotions'
import ToggleSwitch from './Component/ToggleSwitch'
import { Box } from '@chakra-ui/layout';


const Home = () => {
  return (
   <>
   <ProductPromotions/>
   <CurrentOffers/>
   <ToggleSwitch/>
    <CategoryWithProducts/>
   </>
  )
}

export default Home
