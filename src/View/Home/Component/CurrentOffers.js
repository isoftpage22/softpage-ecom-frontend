import React, { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import OffersCard from '../../../Container/OffersCard.js/OffersCard'
import ViewOffersDrawer from '../../../Container/ViewOffersDrawer.js/ViewOffersDrawer'
import { useStoreLayout, useBusinessId } from '@/lib/tenant/TenantContext'
import { getMenuOffers } from '@/lib/menu/storeChrome'
import { useGetCouponBannersQuery } from '@/store/api/promotionsApi'

const CurrentOffers = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
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

  const offers = [...couponOffers, ...themeOffers]
  if (!offers.length) return null
  const featured = offers[0]

  return (
    <>
      <Box bg="var(--brand-background, #ffffff)" py="16px">
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
