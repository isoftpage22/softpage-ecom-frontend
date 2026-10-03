import { Box, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { ArrowForwardIcon } from '@chakra-ui/icons'

const OffersCard = ({ heading, text, image, ctaLabel }) => {
  return (
    <Box
      bg="var(--sp-offer-theme, #111111)"
      color="var(--sp-offer-text, #FFFFFF)"
      minHeight="168px"
      boxShadow="0 10px 28px rgba(15, 23, 42, 0.12)"
      mx="16px"
      borderRadius="16px"
      position="relative"
      overflow="hidden"
    >
      {image ? (
        <Box
          position="absolute"
          inset="0"
          backgroundImage={`url('${image}')`}
          backgroundSize="cover"
          backgroundPosition="center"
          opacity="var(--sp-offer-image-opacity, 0.28)"
        />
      ) : null}
      <Box
        position="absolute"
        inset="0"
        background="var(--sp-offer-wash, linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.82) 100%))"
      />
      <Flex position="relative" flexDir="column" p="18px 20px 16px" minH="168px" justify="space-between">
        <Box>
          <Text
            data-sp-title
            color="var(--sp-offer-text, #FFFFFF)"
            fontWeight="800"
            fontSize="calc(18px * var(--sp-section-scale, 1))"
            fontFamily="var(--sp-section-font, inherit)"
            lineHeight="24px"
            noOfLines={2}
          >
            {heading || 'Exciting offers available'}
          </Text>
          {text && text.trim() !== (heading || '').trim() ? (
            <Text
              color="color-mix(in srgb, var(--sp-offer-text, #FFFFFF) 92%, transparent)"
              fontWeight="500"
              fontSize="calc(13px * var(--sp-section-scale, 1))"
              fontFamily="var(--sp-section-font, inherit)"
              lineHeight="18px"
              mt="8px"
              noOfLines={3}
            >
              {text}
            </Text>
          ) : null}
        </Box>
        <Flex align="center" mt="14px">
          <Text
            color="var(--sp-offer-text, #FFFFFF)"
            fontSize="calc(13px * var(--sp-section-scale, 1))"
            fontFamily="var(--sp-section-font, inherit)"
            fontWeight="800"
            letterSpacing="0.04em"
          >
            {ctaLabel || 'VIEW OFFERS'}
          </Text>
          <ArrowForwardIcon color="var(--sp-offer-text, #FFFFFF)" ml="4px" boxSize="18px" />
        </Flex>
      </Flex>
    </Box>
  )
}

export default OffersCard
