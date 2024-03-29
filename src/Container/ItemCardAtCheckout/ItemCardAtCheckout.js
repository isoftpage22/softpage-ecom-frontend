import { Flex,Box,Text, Spacer,Button } from '@chakra-ui/react'
import React from 'react'
import Card from '../../Components/Card/Card'
import { ChevronDownIcon } from '@chakra-ui/icons'

const ItemCardAtCheckout = (props) => {
  const{addToCart,product,addToCartProduct,deleteToCartProduct,quantity,total_amount}=props
  return (
    <>
      <Card justifyContent="flex-end" alignItems="center" w="100%">
        <Box mr="4px" mt="4px" alignSelf="flex-start" w="8px" h="8px" border="1px solid #E11010"><Box m="0.8px" w="4.4px" h="4.4px" bg="#EC1010" /> </Box>
        <Flex direction="column" w="40%">
          {console.log(props,"checkProps") }
           <Flex flexDirection={"column"} flexWrap={"wrap"}>
          <Text variant="solidCart">{product?.productName}</Text>
          <Text variant="solidCart" fontSize="12px" >(Coke and french Fries)</Text>
          </Flex>

          {
          true ?
           <> 
           <Flex w="20%" > 
            < Text p="0px" size="xs"  fontSize="12px" variant="mutedCart">CUSTOMIZED</Text>
            <ChevronDownIcon size="sm" />
            </Flex>
          </> 
          : ''}
        </Flex>
        <Spacer/>
        <Box w="54px" h="22px" border="1px solid #D7D7D7" py="2px" d="flex" j >
        <Button onClick={()=>deleteToCartProduct(product?.product)} right="10px" colorScheme="none" size="sm" variant="outline" h="15px" p="0px"> - </Button>
        <Spacer />
        <Text variant="solidCart" pb="2px">{quantity}</Text>
        <Spacer />
        <Button onClick={()=>addToCartProduct(product?.product)} left="10px" colorScheme="none" size="sm" variant="outline" h="15px" p="0px"> + </Button>
      </Box>
      <Spacer/>
      <Box w="66px" ml="auto">
        <Text alignSelf="center" variant="solidCart" pb="2px">₹{product?.total_amount}</Text>
      </Box>
      </Card>
    </>
  )
}

export default ItemCardAtCheckout
