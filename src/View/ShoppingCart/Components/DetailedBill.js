import React from 'react'
import { Box, Text,Flex, Spacer, Container, Divider } from '@chakra-ui/react'
import Card from '../../../Components/Card/Card'
const DetailedBill = (props) => {
  const {totalCartBill}=props
  return (
   <Card mb="3px" flexDirection="column" justify="flex-start" alignItems="flex-start">
     <Container>
     <Text>BILL DETAILS</Text>
     <Box mt="3%"  w="100%">
     <Flex w="100%">
       <Text variant="mutedCart">Item Total</Text>
       <Spacer/>
       <Text variant="mutedCart">₹{totalCartBill.totalAmount}</Text>
     </Flex>
     <Flex>
       <Text variant="mutedCart">Taxes & Charges</Text>
     <Spacer/>
       <Text variant="mutedCart">₹{totalCartBill.taxAmount}</Text>
     </Flex> 
     <Flex>
       <Text variant="mutedCart">Tip Amount</Text>
     <Spacer/>
       <Text variant="mutedCart">₹{totalCartBill.tip}</Text>
     </Flex>
     <Flex>
       <Text variant="mutedCart">Discount</Text>
       <Spacer/>
       <Text variant="mutedCart">₹{totalCartBill.discount}</Text>
       </Flex> 
     </Box>
      <Divider mt="3%" mb="3%"/>
      <Flex>
       <Text lineHeight="30px" >To Pay</Text>
       <Spacer/>
       <Text lineHeight="30px" >₹{totalCartBill.totalFinalPriceAmount}</Text>
       </Flex> 
     </Container>
   </Card>
  )
}

export default DetailedBill
