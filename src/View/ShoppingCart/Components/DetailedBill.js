"use client";

import React, { useEffect, useRef, useState } from 'react'
import { Box, Text, Flex, Spacer, Divider, Spinner } from '@chakra-ui/react'
import { formatRupee } from '../../../utils/getdetailedBill'
import { formatPickupEta } from '@/lib/checkout/useDeliveryQuote'

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
        <Flex align="center" gap="4px" minW={0} flex="1">
          <Text variant="mutedCart" noOfLines={1}>Taxes & other charges</Text>
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
  const {totalCartBill, showDelivery, hasAddress, quote, totalsSyncing, etaLabel: lockedEta}=props
  const couponDiscount = Number(totalCartBill.couponDiscount || totalCartBill.discount || 0)
  const etaLabel = lockedEta || formatPickupEta(quote?.pickupEtaMinutes)
  const feeKnown = quote?.serviceable && (quote.freeShippingApplied || quote.shippingCharge != null || quote.winner?.amount != null)
  let feeLabel = '—'
  if (!hasAddress) feeLabel = 'Add address'
  else if (quote && !quote.serviceable) feeLabel = 'Unavailable'
  else if (quote?.freeShippingApplied) feeLabel = 'Free'
  else if (feeKnown || Number(totalCartBill.deliveryFee) > 0) feeLabel = `₹${formatRupee(totalCartBill.deliveryFee)}`
  else if (!quote) feeLabel = 'Calculating…'
  const taxesAmount = totalCartBill.taxesAndOtherCharges ?? totalCartBill.taxAmount

  return (
   <Box px="18px" py="16px" w="100%">
     <Text fontSize="16px" fontWeight="700" color="#111827" mb="12px">Bill details</Text>
     <Flex direction="column" gap="8px" w="100%">
     <Flex w="100%">
       <Text variant="mutedCart">Item total</Text>
       <Spacer/>
       <Text variant="mutedCart" color="#374151">₹{formatRupee(totalCartBill.totalAmount)}</Text>
     </Flex>
     {showDelivery ? (
       <Flex w="100%" align="flex-start">
         <Box>
           <Text variant="mutedCart">Delivery fee</Text>
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
         <PriceValue loading={totalsSyncing && !quote} color={!hasAddress ? "#9A9A9A" : "#374151"}>{feeLabel}</PriceValue>
       </Flex>
     ) : null}
     <TaxesAndOtherChargesRow
       amount={taxesAmount}
       breakdown={totalCartBill.breakdown}
       loading={totalsSyncing}
     />
     {Number(totalCartBill.tip) > 0 ? (
       <Flex>
         <Text variant="mutedCart">Tip</Text>
         <Spacer/>
         <Text variant="mutedCart" color="#374151">₹{formatRupee(totalCartBill.tip)}</Text>
       </Flex>
     ) : null}
     {couponDiscount > 0 ? (
       <Flex>
         <Text variant="mutedCart">Coupon</Text>
         <Spacer/>
         <PriceValue loading={totalsSyncing} color="green.600">
           -₹{formatRupee(couponDiscount)}
         </PriceValue>
       </Flex>
     ) : null}
     </Flex>
      <Divider my="14px" borderStyle="dashed" borderColor="gray.300"/>
      <Flex align="center">
       <Text fontSize="16px" fontWeight="700" color="#111827">To pay</Text>
       <Spacer/>
       <PriceValue loading={totalsSyncing} fontWeight="800" lineHeight="24px" color="#111827" muted={false}>
         <Text as="span" fontSize="18px">₹{formatRupee(totalCartBill.totalFinalPriceAmount)}</Text>
       </PriceValue>
       </Flex>
   </Box>
  )
}

export default DetailedBill
