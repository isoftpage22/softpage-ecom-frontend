import React from 'react'
import { Box, Flex,Text } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'

const BackButtonHeader = () => {
  return (
    <Flex h="45px" w="100%">
      <Flex pl="10px" py="15px" boxShadow="md" w="100%">
    <ArrowBackIcon /> 
    <Text pl="10px" fontSize="12px">APPLY COUPONS</Text>
    </Flex>
 </Flex>
  )
}

export default BackButtonHeader
