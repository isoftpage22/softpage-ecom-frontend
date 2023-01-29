import React from 'react'
import { Box,Flex } from '@chakra-ui/react'
import ProductCard from '../../../Container/Productcard/Productcard'
import PromotionCard from '../../../Container/PromotionCard/PromotionCard'
const ProductPromotions = () => {
  return (
    <Flex
  overflowX="scroll"
  overflowY="hidden"
  alignItems="flex-start"
  h="195px"
  w="100%"
  py="15px"
  px="15px"
  color="white"
  bg="black"
  css={{
    '&::-webkit-scrollbar': {
      width: '1px',
    },
    '&::-webkit-scrollbar-track': {
      width: '1px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'none',
      borderRadius: '24px',
    },
  }}

>
  <Flex justifyContent="space-between">
  <PromotionCard image={"https://cdn.dotpe.in/reports/store/2993/promo-banner/2HFH4EIIILF47WRE1V"}/>
  <PromotionCard image={"https://cdn.dotpe.in/reports/store/2993/promo-banner/2HFH4ETQCBR5496NLA"}/>
  <PromotionCard image={"https://cdn.dotpe.in/reports/store/2993/promo-banner/2HFH4ETQCBR5496NLA"}/>
  <PromotionCard image={"https://cdn.dotpe.in/reports/store/2993/promo-banner/2HFH4F4IVER7CS8RCJ"}/>
  <PromotionCard image={"https://images.unsplash.com/photo-1595053898180-c4a82e07885f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80"}/>

  </Flex>
</Flex>

  )
}

export default ProductPromotions
