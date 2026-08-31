"use client";

import React from 'react'
import { Box, Text, Flex, Spacer, Container, Divider, Spinner } from '@chakra-ui/react'
import Card from '../../../Components/Card/Card'
import { formatEtaMinutes } from '@/lib/checkout/useDeliveryQuote'
import { formatRupee } from '../../../utils/getdetailedBill'

function PriceValue({ loading, children, color, fontWeight, lineHeight, muted = true }) {
  return (
    <Flex align="center" justify="flex-end" gap="6px" minH="18px">
      {loading ? (
        <Spinner size="xs" thickness="2px" color="gray.500" speed="0.7s" />
      ) : null}
      <Text
        variant={muted ? "mutedCart" : undefined}
        color={color}
        fontWeight={fontWeight}
        lineHeight={lineHeight}
        opacity={loading ? 0.45 : 1}
        transition="opacity 0.15s ease"
      >
        {children}
      </Text>
    </Flex>
  )
}

const DetailedBill = (props) => {
  const {totalCartBill, showDelivery, hasAddress, quote, totalsSyncing}=props
  const couponDiscount = Number(totalCartBill.couponDiscount || totalCartBill.discount || 0)
  const etaLabel = formatEtaMinutes(quote?.etaMinutes ?? quote?.winner?.etaMinutes)
  const feeKnown = quote?.serviceable && (quote.freeShippingApplied || quote.shippingCharge != null || quote.winner?.amount != null)
  let feeLabel = '—'
  if (!hasAddress) feeLabel = 'Add address'
  else if (quote && !quote.serviceable) feeLabel = 'Unavailable'
  else if (quote?.freeShippingApplied) feeLabel = 'Free'
  else if (feeKnown || Number(totalCartBill.deliveryFee) > 0) feeLabel = `₹${formatRupee(totalCartBill.deliveryFee)}`
  else if (!quote) feeLabel = 'Calculating…'

  return (
   <Card mb="3px" flexDirection="column" justify="flex-start" alignItems="flex-start">
     <Container>
     <Text>BILL DETAILS</Text>
     <Box mt="3%"  w="100%">
     <Flex w="100%">
       <Text variant="mutedCart">Item Total</Text>
       <Spacer/>
       <Text variant="mutedCart">₹{formatRupee(totalCartBill.totalAmount)}</Text>
     </Flex>
     {showDelivery ? (
       <Box w="100%">
         <Flex>
           <Text variant="mutedCart">Delivery Fee</Text>
           <Spacer/>
           <PriceValue loading={totalsSyncing && !quote}>{feeLabel}</PriceValue>
         </Flex>
         {etaLabel && quote?.serviceable ? (
           <Text variant="mutedCart" fontSize="12px" mt="2px">Delivery in {etaLabel}</Text>
         ) : null}
       </Box>
     ) : null}
     <Flex>
       <Text variant="mutedCart">Taxes & Charges</Text>
     <Spacer/>
       <PriceValue loading={totalsSyncing}>₹{formatRupee(totalCartBill.taxAmount)}</PriceValue>
     </Flex> 
     <Flex>
       <Text variant="mutedCart">Tip Amount</Text>
     <Spacer/>
       <Text variant="mutedCart">₹{formatRupee(totalCartBill.tip)}</Text>
     </Flex>
     {couponDiscount > 0 ? (
       <Flex>
         <Text variant="mutedCart">Coupon</Text>
         <Spacer/>
         <PriceValue loading={totalsSyncing} color="green.600">
           -₹{formatRupee(couponDiscount)}
         </PriceValue>
       </Flex>
     ) : null}
     </Box>
      <Divider mt="3%" mb="3%"/>
      <Flex align="center">
       <Text lineHeight="30px" >To Pay</Text>
       <Spacer/>
       <PriceValue loading={totalsSyncing} fontWeight="700" lineHeight="30px" muted={false}>
         ₹{formatRupee(totalCartBill.totalFinalPriceAmount)}
       </PriceValue>
       </Flex> 
     </Container>
   </Card>
  )
}

export default DetailedBill
