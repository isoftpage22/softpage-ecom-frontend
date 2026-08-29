import React from 'react'
import { Flex } from '@chakra-ui/react'
import PromotionCard from '../../../Container/PromotionCard/PromotionCard'
import { useStoreLayout } from '@/lib/tenant/TenantContext'
import { CHROME_BAR_BG, getMenuBanners } from '@/lib/menu/storeChrome'

const ProductPromotions = () => {
  const layout = useStoreLayout()
  const banners = getMenuBanners(layout)

  if (!banners.length) return null

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
        {banners.map((banner, index) => (
          <PromotionCard
            key={banner.key}
            image={banner.image}
            href={banner.href}
            heading={banner.heading}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </Flex>
    </Flex>
  )
}

export default ProductPromotions
