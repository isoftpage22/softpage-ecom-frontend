import { Box } from '@chakra-ui/react'
import React from 'react'
import ItemCardAtCheckout from '../../Container/ItemCardAtCheckout/ItemCardAtCheckout'
import DetailedBill from './Components/DetailedBill'
import DiscountCoupons from './Components/DiscountCoupons'
import MoneyTip from './Components/MoneyTip'
import SpecialInstructions from './Components/SpecialInstructions'
const ShoppingCart = () => {
  return (
    <>
    <Box bg="#f4f4f5" >
    <ItemCardAtCheckout/>
     <SpecialInstructions/>
     <MoneyTip/>
     <DiscountCoupons/>
     <DetailedBill />
     </Box>

    </>
  )
}

export default ShoppingCart
