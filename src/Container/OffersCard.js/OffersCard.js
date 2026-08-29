import { Box, Flex, Text, Spacer } from '@chakra-ui/react'
import React from 'react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { CHROME_ACCENT, CHROME_SURFACE, CHROME_TEXT } from '@/lib/menu/storeChrome'

const OffersCard = ({ heading, text, image, ctaLabel }) => {
  return (
    <Box
      bg={CHROME_SURFACE}
      color={CHROME_TEXT}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      minHeight="161px"
      boxShadow="md"
      mx="16px"
      borderRadius="9px"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor={CHROME_ACCENT}
    >
      {image ? (
        <Box
          position="absolute"
          inset="0"
          backgroundImage={`url('${image}')`}
          backgroundSize="cover"
          backgroundPosition="center"
          opacity={0.22}
        />
      ) : null}
      <Flex position="relative" flexDir="column" p="18px 0 1px 24px" minH="110px" alignSelf="center">
        <Text fontWeight="700" fontSize="18px">{heading || 'Exciting offers available'}</Text>
        <Box fontSize="14px" mt="10px" lineHeight="1.6" fontWeight="400" marginBottom="4px">
          <Flex>
            <Box>
              {text ? (
                <Text opacity="0.8" color={CHROME_TEXT} fontWeight="400" fontSize="14px" noOfLines={3}>
                  {text}
                </Text>
              ) : null}
            </Box>
          </Flex>
        </Box>
      </Flex>
      <hr />
      <Flex position="relative" p="8px 0 20px 24px" h="30px">
        <Text fontSize="12px">{ctaLabel || 'VIEW OFFERS'}</Text>
        <ArrowForwardIcon pl="5px" w="30px" />
        <Spacer />
      </Flex>
    </Box>
  )
}

export default OffersCard
