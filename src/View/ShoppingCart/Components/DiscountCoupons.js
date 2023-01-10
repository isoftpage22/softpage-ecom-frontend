import { Container, Flex, Image, Spacer, Text, Box } from '@chakra-ui/react'
import React from 'react'
import Discount from '../Assets/Images/Discount.svg'
import { ChevronRightIcon,CloseIcon } from '@chakra-ui/icons'
import Ripples from 'react-ripples'
import '../Assets/CSS/ShoppingCart.css'

const DiscountCoupons = () => {


const handleRemoveCoupon=()=>{

}
  return (
    <Box bg="white" w="100%" mb="3px">
      <Ripples className="ripple-display">
        <Container w="100%">
          <Flex p="10px" w="100%">
            <Image boxSize="20px" src={Discount} />
            <Text textAlign="center" fontSize="13px" ml="10px">APPLY COUPON</Text>
            <Spacer />
            <CloseIcon width="11px" size="sm" onClick ={()=>handleRemoveCoupon()}/>
          </Flex>
        </Container>
      </Ripples>
    </Box>
  )
}

export default DiscountCoupons
