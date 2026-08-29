import React from 'react'
import { Box, Text,Flex, Spacer, Container, Divider } from '@chakra-ui/react'
import Card from '../../../Components/Card/Card'
import { formatEtaMinutes } from '@/lib/checkout/useDeliveryQuote'

const DetailedBill = (props) => {
  const {totalCartBill, showDelivery, hasAddress, quote}=props
  const etaLabel = formatEtaMinutes(quote?.etaMinutes ?? quote?.winner?.etaMinutes)
  const feeKnown = quote?.serviceable && (quote.freeShippingApplied || quote.shippingCharge != null || quote.winner?.amount != null)
  let feeLabel = '—'
  if (!hasAddress) feeLabel = 'Add address'
  else if (!quote) feeLabel = 'Calculating…'
  else if (!quote.serviceable) feeLabel = 'Unavailable'
  else if (quote.freeShippingApplied) feeLabel = 'Free'
  else if (feeKnown) feeLabel = `₹${totalCartBill.deliveryFee}`

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
     {showDelivery ? (
       <Box w="100%">
         <Flex>
           <Text variant="mutedCart">Delivery Fee</Text>
           <Spacer/>
           <Text variant="mutedCart">{feeLabel}</Text>
         </Flex>
         {etaLabel && quote?.serviceable ? (
           <Text variant="mutedCart" fontSize="12px" mt="2px">Delivery in {etaLabel}</Text>
         ) : null}
       </Box>
     ) : null}
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
