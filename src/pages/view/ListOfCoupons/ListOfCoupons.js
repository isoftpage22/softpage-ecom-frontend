import { Flex, Icon, Spacer, Text, Box, Image, Button } from '@chakra-ui/react'
import React from 'react'
import { MdLocalOffer } from "react-icons/md";
import Card from '../../Components/Card/Card';
const ListOfCoupons = () => {
  return (
    <>
      <Card w="100%" justifyContent="center" alignItems="center" >
        {/* Coupon CARD */}
            <Image borderRadius="full"
              mr="10px"
              boxSize="60px"
              src="https://images.unsplash.com/photo-1555274175-75f4056dfd05?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80"
              alt="Segun Adebayo"
            />

              <Flex  w="60%" flexDirection="column" >
                <Flex w="55%" justifyContent="space-evenly" py="5px" pl="2px" bg="#fffae6" border="1px" borderColor="#dacdb6">
                  <Text variant="muted" >STEALDEAL</Text>
                  <Icon color="black" size="sm" as={MdLocalOffer} />
                </Flex>
                <Text variant="muted"> Use this code to get 15% of on your order above Rs.200</Text>
              </Flex>
            <Spacer />
            <Button variant="ghost" alignSelf="center" size="sm" >APPLY</Button>

      </Card>
    </>
  )
}

export default ListOfCoupons
