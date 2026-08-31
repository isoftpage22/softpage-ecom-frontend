"use client";

import React, { useEffect, useState } from 'react'
import { Flex } from '@chakra-ui/react'
import PromotionCard from '../../../Container/PromotionCard/PromotionCard'
import { useStoreLayout, useBusinessId } from '@/lib/tenant/TenantContext'
import { CHROME_BAR_BG, getMenuBanners } from '@/lib/menu/storeChrome'
import { useGetCouponBannersQuery } from '@/store/api/promotionsApi'

const ProductPromotions = () => {
  const layout = useStoreLayout()
  const businessId = useBusinessId()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  const banners = getMenuBanners(layout)
  const { data: couponBanners } = useGetCouponBannersQuery(
    { businessId, placement: 'home' },
    { skip: !ready || !businessId },
  )

  const couponSlides = (couponBanners || [])
    .filter((b) => b.imageUrl)
    .map((b) => ({
      key: `coupon-${b.id}`,
      image: b.imageUrl,
      href: b.ctaHref || '/coupons',
      heading: b.title,
    }))

  const merged = [...couponSlides, ...banners]
  if (!merged.length) return null

  return (
    <Flex
      overflowX="scroll"
      overflowY="hidden"
      alignItems="flex-start"
      h="195px"
      w="100%"
      py="15px"
      px="15px"
      color="white"
      bg={CHROME_BAR_BG}
      css={{
        '&::-webkit-scrollbar': {
          width: '1px',
        },
        '&::-webkit-scrollbar-track': {
          width: '1px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'none',
          borderRadius: '24px',
        },
      }}
    >
      <Flex justifyContent="space-between">
        {merged.map((banner, index) => (
          <PromotionCard
            key={banner.key}
            image={banner.image}
            href={banner.href}
            heading={banner.heading}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </Flex>
    </Flex>
  )
}

export default ProductPromotions
