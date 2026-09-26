"use client";

import React, { useEffect, useRef, useState } from 'react'
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

function TaxesAndOtherChargesRow({ amount, breakdown, loading }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!(Number(amount) > 0)) return null

  return (
    <Box ref={rootRef} position="relative" w="100%">
      <Flex w="100%" align="center">
        <Flex align="center" gap="4px" minW={0}>
          <Text variant="mutedCart">Taxes & other charges</Text>
          {breakdown?.length > 0 ? (
            <Box
              as="button"
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              w="16px"
              h="16px"
              borderRadius="full"
              border="1px solid #C4C4C4"
              color="#6B7280"
              fontSize="10px"
              fontWeight="700"
              lineHeight="14px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              aria-label="Tax and charge details"
            >
              i
            </Box>
          ) : null}
        </Flex>
        <Spacer />
        <PriceValue loading={loading}>₹{formatRupee(amount)}</PriceValue>
      </Flex>
      {open && breakdown?.length > 0 ? (
        <Box
          position="absolute"
          left={0}
          right={0}
          zIndex={20}
          mt="6px"
          p="10px"
          bg="white"
          border="1px solid #E5E7EB"
          borderRadius="10px"
          boxShadow="md"
        >
          {breakdown.map((line) => (
            <Flex key={`${line.label}-${line.amount}`} justify="space-between" gap="12px" py="2px">
              <Text fontSize="11px" color="#6B7280">{line.label}</Text>
              <Text fontSize="11px" fontWeight="600" color="#111827">₹{formatRupee(line.amount)}</Text>
            </Flex>
          ))}
        </Box>
      ) : null}
    </Box>
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
  const taxesAmount = totalCartBill.taxesAndOtherCharges ?? totalCartBill.taxAmount

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
       <Flex w="100%" align="flex-start">
         <Box>
           <Text variant="mutedCart">Delivery Fee</Text>
           {etaLabel && quote?.serviceable ? (
             <Text
               fontSize="11px"
               lineHeight="14px"
               color="#9A9A9A"
               mt="1px"
               letterSpacing="0"
               textTransform="none"
             >
               {etaLabel}
             </Text>
           ) : null}
         </Box>
         <Spacer />
         <PriceValue loading={totalsSyncing && !quote}>{feeLabel}</PriceValue>
       </Flex>
     ) : null}
     <TaxesAndOtherChargesRow
       amount={taxesAmount}
       breakdown={totalCartBill.breakdown}
       loading={totalsSyncing}
     />
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
