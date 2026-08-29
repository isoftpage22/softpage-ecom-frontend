import { Image, Box } from '@chakra-ui/react'
import React from 'react'
import { Link } from '../../lib/nav'

const PromotionCard = ({ image, href, heading, loading = "lazy" }) => {
  const card = (
    <Box
      mr="15px"
      maxWidth="310px"
      minWidth="310px"
      maxHeight="150px"
      minHeight="150px"
      borderRadius="8px"
      overflow="hidden"
      position="relative"
      cursor={href ? 'pointer' : 'default'}
    >
      <Image
        maxHeight="100%"
        minHeight="100%"
        maxWidth="100%"
        minWidth="100%"
        src={image}
        alt={heading || ''}
        objectFit="cover"
        loading={loading}
        decoding="async"
      />
    </Box>
  )
  if (!href) return card
  return (
    <Link to={href} href={href}>
      {card}
    </Link>
  )
}

export default PromotionCard
