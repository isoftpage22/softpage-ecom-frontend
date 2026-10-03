import { Box } from '@chakra-ui/react'
import React from 'react'
import { Link } from '../../lib/nav'

const PromotionCard = ({ image, href, heading, loading = "lazy" }) => {
  const eager = loading === "eager"
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
      {image ? (
        <img
          src={image}
          alt={heading || ''}
          width={310}
          height={150}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            minWidth: "100%",
            minHeight: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      ) : (
        <Box
          bg="#2a2a2a"
          color="white"
          w="100%"
          h="100%"
          display="flex"
          alignItems="flex-end"
          p="12px"
          fontSize="14px"
          fontWeight="700"
        >
          {heading || "Recommended"}
        </Box>
      )}
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
