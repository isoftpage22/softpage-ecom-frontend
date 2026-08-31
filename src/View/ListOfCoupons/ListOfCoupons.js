"use client";

import {
  Flex,
  Icon,
  Text,
  Box,
  Button,
  Input,
  Skeleton,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { MdLocalOffer } from 'react-icons/md'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import { useHistory } from '../../lib/nav'
import { useBusinessId, useBusinessAppId } from '@/lib/tenant/TenantContext'
import { useGuestSessionId } from '@/lib/cart/session'
import { useSelector } from 'react-redux'
import { useGetAvailableCouponsQuery } from '@/store/api/promotionsApi'
import { useApplyCouponMutation, useGetCartQuery, useReplaceCartLinesMutation } from '@/store/api/cartApi'
import { lineToAddToCartInput } from '@/lib/checkout/placeMenuOrder'

function discountParts(coupon) {
  if (!coupon) return { amount: '', unit: 'OFF' }
  if (coupon.type === 'percentage') return { amount: `${coupon.value}%`, unit: 'OFF' }
  return { amount: `₹${coupon.value}`, unit: 'OFF' }
}

function formatCouponHeadline(name) {
  if (!name) return ''
  return String(name)
    .replace(/(\d+)\s*%\s*of\b/gi, '$1% off')
    .replace(/\s+%\s+/g, '% ')
    .replace(/\boff on\b/gi, 'off on')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatValidUntil(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CouponTicket({ coupon, applied, applying, onApply }) {
  const { amount, unit } = discountParts(coupon)
  const until = formatValidUntil(coupon.validUntil)
  const ineligible = !coupon.isApplicable && !applied
  const meta = [
    coupon.minimumOrderAmount ? `Min order ₹${coupon.minimumOrderAmount}` : null,
    coupon.maximumDiscountAmount && coupon.type === 'percentage'
      ? `Max ₹${coupon.maximumDiscountAmount}`
      : null,
    until ? `Till ${until}` : null,
  ].filter(Boolean)
  const railBg = applied ? '#15803D' : '#111111'
  const headline = formatCouponHeadline(coupon.name)
  const description = formatCouponHeadline(coupon.description)
  const showDescription =
    Boolean(description) && description.toLowerCase() !== headline.toLowerCase()

  return (
    <Flex
      bg="white"
      borderRadius="16px"
      overflow="hidden"
      border="1px solid"
      borderColor={applied ? '#BBF7D0' : '#E5E7EB'}
      boxShadow="0 8px 24px rgba(15, 23, 42, 0.08)"
      opacity={ineligible ? 0.7 : 1}
    >
      <Flex
        w="86px"
        flexShrink={0}
        bg={railBg}
        direction="column"
        align="center"
        justify="center"
        px="8px"
        py="16px"
        position="relative"
      >
        <Text
          color="#FFFFFF"
          fontSize="22px"
          fontWeight="800"
          lineHeight="1.05"
          textAlign="center"
          letterSpacing="-0.02em"
        >
          {amount}
        </Text>
        <Text
          color="#FFFFFF"
          fontSize="11px"
          fontWeight="800"
          letterSpacing="0.12em"
          mt="4px"
          textAlign="center"
        >
          {unit}
        </Text>
        <Box
          position="absolute"
          right="-8px"
          top="50%"
          mt="-8px"
          w="16px"
          h="16px"
          borderRadius="full"
          bg="#F4F4F5"
          border="1px solid #E5E7EB"
          borderLeft="none"
        />
      </Flex>
      <Flex flex="1" minW={0} p="14px 12px 14px 18px" gap="10px" align="center">
        <Box flex="1" minW={0}>
          <Flex
            w="fit-content"
            maxW="100%"
            align="center"
            gap="6px"
            px="8px"
            py="4px"
            mb="8px"
            borderRadius="999px"
            bg="#ECFDF5"
            border="1.5px dashed"
            borderColor="#059669"
          >
            <Icon as={MdLocalOffer} boxSize="13px" color="#047857" />
            <Text
              color="#065F46"
              fontSize="13px"
              fontWeight="800"
              letterSpacing="0.08em"
              noOfLines={1}
            >
              {coupon.code}
            </Text>
          </Flex>
          {headline ? (
            <Text color="#111827" fontSize="15px" fontWeight="700" lineHeight="20px" noOfLines={2}>
              {headline}
            </Text>
          ) : null}
          {showDescription ? (
            <Text color="#4B5563" fontSize="12px" mt="4px" noOfLines={2} lineHeight="16px">
              {description}
            </Text>
          ) : null}
          {meta.length ? (
            <Text color="#6B7280" fontSize="11px" fontWeight="600" mt="6px">
              {meta.join(' · ')}
            </Text>
          ) : null}
          {ineligible && coupon.ineligibilityReason ? (
            <Text color="#B91C1C" fontSize="11px" fontWeight="600" mt="6px">
              {coupon.ineligibilityReason}
            </Text>
          ) : null}
          {applied ? (
            <Text color="#15803D" fontSize="11px" fontWeight="800" mt="6px">
              Applied to your cart
            </Text>
          ) : null}
        </Box>
        <Button
          variant="unstyled"
          h="40px"
          minW="82px"
          px="14px"
          borderRadius="10px"
          fontSize="12px"
          fontWeight="800"
          letterSpacing="0.06em"
          color="#FFFFFF"
          bg={applied ? '#15803D' : ineligible ? '#D1D5DB' : '#111111'}
          _hover={{ bg: applied ? '#166534' : ineligible ? '#D1D5DB' : '#000000' }}
          isDisabled={ineligible || applying}
          isLoading={applying}
          onClick={() => onApply(coupon.code)}
        >
          {applied ? 'APPLIED' : 'APPLY'}
        </Button>
      </Flex>
    </Flex>
  )
}

const ListOfCoupons = () => {
  const history = useHistory()
  const businessId = useBusinessId()
  const businessAppId = useBusinessAppId()
  const sessionId = useGuestSessionId()
  const { data: cart } = useGetCartQuery(
    { businessId, businessAppId, sessionId },
    { skip: !businessId || !businessAppId || !sessionId },
  )
  const localProducts = useSelector((state) => state.shoppingCart.addToCart?.products || [])
  const localItemCount = (localProducts || []).reduce(
    (sum, line) => sum + (Number(line.quantity) || 0),
    0,
  )
  const itemCount = Number(cart?.itemCount) || localItemCount
  const [error, setError] = useState('')
  const [applyingCode, setApplyingCode] = useState('')
  const [manualCode, setManualCode] = useState('')

  const { data: coupons, isLoading } = useGetAvailableCouponsQuery(
    { businessId, cartId: cart?.id },
    { skip: !businessId },
  )
  const [applyCoupon] = useApplyCouponMutation()
  const [replaceCartLines] = useReplaceCartLinesMutation()

  const appliedCode = (cart?.appliedCoupon?.code || '').toUpperCase()

  const handleApply = async (code) => {
    const nextCode = String(code || '').trim().toUpperCase()
    if (!nextCode) return
    setError('')
    if (!itemCount) {
      setError('Add items to your cart first, then apply a coupon')
      return
    }
    setApplyingCode(nextCode)
    try {
      let cartId = cart?.id
      if (!cartId) {
        if (!businessId || !businessAppId || !sessionId) {
          setError('Could not load your cart')
          return
        }
        const synced = await replaceCartLines({
          businessId,
          businessAppId,
          sessionId,
          input: {
            lines: (localProducts || []).map((line) => lineToAddToCartInput(line)),
          },
        }).unwrap()
        cartId = synced?.id
      }
      if (!cartId) {
        setError('Could not load your cart')
        return
      }
      await applyCoupon({ businessId, cartId, couponCode: nextCode }).unwrap()
      history.push('/cart')
    } catch (e) {
      setError(e?.data?.message || e?.message || 'This coupon cannot be applied')
    } finally {
      setApplyingCode('')
    }
  }

  const list = coupons || []

  return (
    <Box minH="100vh" bg="#f4f4f5">
      <TopBarWithBackButton headerText="Coupons" />

      <Box px="16px" pt="16px" pb="40px">
        <Box
          bg="white"
          borderRadius="16px"
          p="14px"
          mb="16px"
          border="1px solid #eceff4"
          boxShadow="0 8px 24px rgba(15, 23, 42, 0.04)"
        >
          <Text fontSize="13px" fontWeight="700" color="#111827" mb="10px">
            Have a code?
          </Text>
          <Flex gap="8px">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              textTransform="uppercase"
              letterSpacing="0.04em"
              fontWeight="700"
              fontSize="14px"
              color="#111827"
              h="44px"
              borderRadius="12px"
              bg="#f8fafc"
              borderColor="#e5e7eb"
              _focus={{ borderColor: '#111111', boxShadow: 'none', bg: 'white' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApply(manualCode)
              }}
            />
            <Button
              variant="unstyled"
              h="44px"
              minW="88px"
              px="16px"
              borderRadius="12px"
              bg="#111111"
              color="white"
              fontSize="13px"
              fontWeight="800"
              isDisabled={!manualCode.trim() || !!applyingCode}
              isLoading={Boolean(manualCode.trim()) && applyingCode === manualCode.trim().toUpperCase()}
              onClick={() => handleApply(manualCode)}
            >
              APPLY
            </Button>
          </Flex>
        </Box>

        {error ? (
          <Box bg="#FFF5F5" border="1px solid #FED7D7" borderRadius="12px" px="14px" py="10px" mb="16px">
            <Text fontSize="13px" color="#9B2C2C" fontWeight="600">
              {error}
            </Text>
          </Box>
        ) : null}

        <Flex align="center" mb="12px">
          <Text fontSize="13px" fontWeight="800" letterSpacing="0.04em" color="gray.600">
            AVAILABLE OFFERS
          </Text>
          {!isLoading && list.length ? (
            <Text fontSize="12px" color="gray.500" ml="8px">
              {list.length}
            </Text>
          ) : null}
        </Flex>

        {isLoading ? (
          <Flex direction="column" gap="12px">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} h="112px" borderRadius="16px" />
            ))}
          </Flex>
        ) : !list.length ? (
          <Flex
            direction="column"
            align="center"
            textAlign="center"
            bg="white"
            borderRadius="16px"
            border="1px dashed #d4d4d8"
            px="24px"
            py="48px"
          >
            <Flex
              w="56px"
              h="56px"
              borderRadius="full"
              bg="#fff8e8"
              align="center"
              justify="center"
              mb="14px"
            >
              <Icon as={MdLocalOffer} boxSize="26px" color="#047857" />
            </Flex>
            <Text fontSize="16px" fontWeight="800" color="#111827">
              No coupons right now
            </Text>
            <Text fontSize="13px" color="gray.500" mt="6px" maxW="260px">
              Offers will show up here when the store publishes them. You can still enter a code above.
            </Text>
            <Button
              mt="18px"
              variant="unstyled"
              h="40px"
              px="18px"
              borderRadius="12px"
              bg="#111111"
              color="white"
              fontSize="13px"
              fontWeight="800"
              onClick={() => history.push(itemCount ? '/cart' : '/')}
            >
              {itemCount ? 'Back to cart' : 'Browse menu'}
            </Button>
          </Flex>
        ) : (
          <Flex direction="column" gap="12px">
            {list.map((coupon) => (
              <CouponTicket
                key={coupon.code}
                coupon={coupon}
                applied={appliedCode === String(coupon.code).toUpperCase()}
                applying={applyingCode === String(coupon.code).toUpperCase()}
                onApply={handleApply}
              />
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  )
}

export default ListOfCoupons
