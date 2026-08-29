import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import OffersCard from '../../../Container/OffersCard.js/OffersCard'
import ViewOffersDrawer from '../../../Container/ViewOffersDrawer.js/ViewOffersDrawer'
import { useStoreLayout } from '@/lib/tenant/TenantContext'
import { getMenuOffers } from '@/lib/menu/storeChrome'

const CurrentOffers = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false)
  const layout = useStoreLayout()
  const offers = getMenuOffers(layout)
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
