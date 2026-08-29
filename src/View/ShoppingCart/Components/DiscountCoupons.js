import { Container, Flex, Icon, Spacer, Text, Box } from '@chakra-ui/react'
import React from 'react'
import { CloseIcon } from '@chakra-ui/icons'
import { MdLocalOffer } from 'react-icons/md'
import Ripples from 'react-ripples'
import '../Assets/CSS/ShoppingCart.css'

const DiscountCoupons = () => {


const handleRemoveCoupon=()=>{

}
  return (
    <Box bg="white" w="100%" mb="3px">
      <Ripples className="ripple-display">
        <Container w="100%">
          <Flex p="10px" w="100%" alignItems="center">
            <Icon as={MdLocalOffer} boxSize="20px" />
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
