"use client";

import React, { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import OffersCard from '../../../Container/OffersCard.js/OffersCard'
import ViewOffersDrawer from '../../../Container/ViewOffersDrawer.js/ViewOffersDrawer'
import { useStoreLayout, useBusinessId } from '@/lib/tenant/TenantContext'
import { getMenuOffers } from '@/lib/menu/storeChrome'
import { isThemePreview } from '@/lib/theme-engine/previewSession'
import { useGetCouponBannersQuery } from '@/store/api/promotionsApi'

const CurrentOffers = ({ offers: offersProp, drawerOnly = false } = {}) => {
  const [toggleDrawer, setToggleDrawer] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  useEffect(() => {
    const open = () => setToggleDrawer(true)
    window.addEventListener('sp:open-offers', open)
    return () => window.removeEventListener('sp:open-offers', open)
  }, [])
  const layout = useStoreLayout()
  const businessId = useBusinessId()
  const themeOffers = getMenuOffers(layout)
  const { data: couponBanners } = useGetCouponBannersQuery(
    { businessId, placement: 'home' },
    { skip: !ready || !businessId },
  )

  const couponOffers = (couponBanners || []).map((b) => ({
    key: `coupon-${b.id}`,
    heading: b.title,
    text: b.subtitle || (b.couponCode ? `Use code ${b.couponCode}` : ''),
    image: b.imageUrl || undefined,
    href: b.ctaHref || '/coupons',
    ctaLabel: b.ctaLabel || (b.couponCode ? `USE ${b.couponCode}` : 'VIEW COUPONS'),
  }))

  const offers = Array.isArray(offersProp) && offersProp.length ? offersProp : [...couponOffers, ...themeOffers]
  if (drawerOnly) {
    return (
      <ViewOffersDrawer
        toggleDrawer={toggleDrawer}
        setToggleDrawer={setToggleDrawer}
        offers={offers}
      />
    )
  }
  if (!offers.length) {
    if (isThemePreview()) {
      return (
        <Box mx="12px" my="8px" p="16px" border="1px dashed #94a3b8" borderRadius="8px" color="#64748b" fontSize="13px" textAlign="center">
          Offers — no coupons yet. This block sits here once you add one.
        </Box>
      )
    }
    return null
  }
  const featured = offers[0]

  return (
    <>
      <Box bg="var(--sp-section-surface, var(--brand-background, #ffffff))" py="16px">
        <Box onClick={() => setToggleDrawer(!toggleDrawer)} cursor="pointer">
          <OffersCard
            heading={featured.heading}
            text={featured.text}
            image={featured.image}
            ctaLabel={featured.ctaLabel}
          />
        </Box>
      </Box>
      <ViewOffersDrawer
        toggleDrawer={toggleDrawer}
        setToggleDrawer={setToggleDrawer}
        offers={offers}
      />
    </>
  )
}

export default CurrentOffers
