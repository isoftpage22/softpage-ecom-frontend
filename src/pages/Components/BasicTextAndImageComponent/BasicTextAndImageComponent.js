import { Flex, Icon, Spacer, Text, Box, Image, Button } from '@chakra-ui/react'
import React from 'react'

import Card from '../../Components/Card/Card';

const BasicTextAndImageComponent = ({image,children}) => {
  return (
    <>
      <Card w="100%" justifyContent="center" alignItems="center" p="0" py="20px" >
        {/* Coupon CARD */}
            <Image borderRadius="full"
              mr="10px"
              boxSize="60px"
              src={image}
            />
              <Flex>
             {children}
            </Flex>
      </Card>
    </>
  )
}

export default BasicTextAndImageComponent
