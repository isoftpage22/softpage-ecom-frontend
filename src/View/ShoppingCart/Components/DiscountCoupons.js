"use client";

import { Flex, Icon, Text, Box, IconButton, Spinner } from '@chakra-ui/react'
import React, { useState } from 'react'
import { CloseIcon } from '@chakra-ui/icons'
import { MdLocalOffer } from 'react-icons/md'
import { useHistory } from '../../../lib/nav'
import { useBusinessId, useBusinessAppId } from '@/lib/tenant/TenantContext'
import { useGuestSessionId } from '@/lib/cart/session'
import { useGetCartQuery, useRemoveCouponMutation } from '@/store/api/cartApi'
import { formatRupee } from '../../../utils/getdetailedBill'

const DiscountCoupons = ({ cart: cartProp }) => {
  const history = useHistory()
  const businessId = useBusinessId()
  const businessAppId = useBusinessAppId()
  const sessionId = useGuestSessionId()
  const { data: fetchedCart } = useGetCartQuery(
    { businessId, businessAppId, sessionId },
    { skip: !!cartProp?.id || !businessId || !businessAppId || !sessionId },
  )
  const cart = cartProp?.id ? cartProp : fetchedCart
  const [removeCoupon, { isLoading }] = useRemoveCouponMutation()
  const [error, setError] = useState('')
  const applied = cart?.appliedCoupon

  const handleRemoveCoupon = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!cart?.id || !applied || isLoading) return
    setError('')
    try {
      await removeCoupon({ businessId, cartId: cart.id }).unwrap()
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Could not remove coupon')
    }
  }

  return (
    <Box bg="white" w="100%" mb="3px">
      <Flex w="100%" alignItems="center" px="16px" py="12px">
        <Flex
          flex="1"
          minW={0}
          alignItems="center"
          cursor="pointer"
          onClick={() => history.push('/coupons')}
        >
          <Icon as={MdLocalOffer} boxSize="20px" color="#111111" flexShrink={0} />
          <Box ml="10px" minW={0}>
            <Text textAlign="left" fontSize="13px" fontWeight="700" color="#111827" noOfLines={1}>
              {applied ? applied.code : 'APPLY COUPON'}
            </Text>
            {applied ? (
              <Text fontSize="11px" color="#15803D" fontWeight="700">
                -₹{formatRupee(applied.discountAmount || cart?.discount || 0)}
              </Text>
            ) : (
              <Text fontSize="11px" color="#6B7280">
                View available offers
              </Text>
            )}
          </Box>
        </Flex>
        {applied ? (
          <IconButton
            aria-label="Remove coupon"
            icon={isLoading ? <Spinner size="xs" /> : <CloseIcon boxSize="10px" />}
            size="sm"
            variant="ghost"
            color="#111111"
            isDisabled={isLoading}
            onClick={handleRemoveCoupon}
            onMouseDown={(event) => event.stopPropagation()}
          />
        ) : null}
      </Flex>
      {error ? (
        <Text px="16px" pb="10px" fontSize="12px" color="#B91C1C">
          {error}
        </Text>
      ) : null}
    </Box>
  )
}

export default DiscountCoupons
