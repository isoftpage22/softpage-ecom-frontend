import { Box, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { ArrowForwardIcon } from '@chakra-ui/icons'

const OffersCard = ({ heading, text, image, ctaLabel }) => {
  return (
    <Box
      bg="#111111"
      color="#FFFFFF"
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
          opacity={0.28}
        />
      ) : null}
      <Box position="absolute" inset="0" bg="linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.82) 100%)" />
      <Flex position="relative" flexDir="column" p="18px 20px 16px" minH="168px" justify="space-between">
        <Box>
          <Text color="#FFFFFF" fontWeight="800" fontSize="18px" lineHeight="24px" noOfLines={2}>
            {heading || 'Exciting offers available'}
          </Text>
          {text && text.trim() !== (heading || '').trim() ? (
            <Text color="rgba(255,255,255,0.92)" fontWeight="500" fontSize="13px" lineHeight="18px" mt="8px" noOfLines={3}>
              {text}
            </Text>
          ) : null}
        </Box>
        <Flex align="center" mt="14px">
          <Text color="#FFFFFF" fontSize="13px" fontWeight="800" letterSpacing="0.04em">
            {ctaLabel || 'VIEW OFFERS'}
          </Text>
          <ArrowForwardIcon color="#FFFFFF" ml="4px" boxSize="18px" />
        </Flex>
      </Flex>
    </Box>
  )
}

export default OffersCard
