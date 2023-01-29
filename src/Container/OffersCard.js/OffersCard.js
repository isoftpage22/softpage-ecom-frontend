import { Box, Flex, Text, Image, Spacer } from '@chakra-ui/react'
import React from 'react'
import { ArrowForwardIcon } from '@chakra-ui/icons'

const OffersCard = () => {
  return (
    <>

      <Box
        backgroundImage="url('https://cdn.dotpe.in/cfe/image/img-promo-banner-bg.png')"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        minHeight="161px"
        maxHeight="161px"
        boxShadow="md"
        mx="16px"
        borderRadius="9px"
        position="relative"
        border="1px solid #f2d5ba">
        <Flex flexDir="column" p="18px 0 1px 24px" minH="110px" alignSelf="center">
          <Text fontWeight="700" fontSize="18px">Exciting offers available</Text>
          <Box fontSize="14px" mt="10px" lineHeight="1.6" fontWeight="400" marginBottom="4px">
            <Flex>
              <Box>
                <Text
                  border="1px solid #eb9013"
                  opacity="1"
                  fontSize="14px"
                  px="3px"
                  fontWeight="700"
                  borderRadius="4px"
                  bg="#fadea8"
                  boxShadow="0 3px 6px rgb(0 0 0 / 16%)"
                  as="span"
                >
                  Instant 10% OFF
             </Text>
                <Text opacity="0.51" color="#000" fontWeight="400" fontSize="14px" as="span"> on Any debit & credit card </Text>
              </Box>
              <Box maxWidth="72px" minWidth="72px" maxHeight="72px" minHeight="72px">
                <Image maxHeight="100%" minHeight="100%" maxWidth="100%" minWidth="100%" src={"https://cdn.dotpe.in/cfe/image/img-banner-gift.png"} />
              </Box>
            </Flex>
          </Box>
        </Flex>
        <hr></hr>
        <Flex p="8px 0 20px 24px" h="30px">
          <Text fontSize="12px" >VIEW OFFERS</Text>
          <ArrowForwardIcon pl="5px" w="30px"/>
          <Spacer/>
          <Box>
            <Flex pr="3px">
              <Box d="flex" justifyContent="center" alignItems="center" w="28px" minHeight="22px" maxHeight="22px"  bg="white"><Image width="25px"
  src="https://cdn.dotpe.in/cfe/image/dotpeCardOffer.png"/></Box>
              <Box minHeight="22px" maxHeight="22px" w="28px"  py="1px" ml="8px" mb="3px" bg="white"><Image width="25px" src="https://cdn.dotpe.in/cfe/image/amazonPay.png"/></Box>
              <Box minHeight="22px" maxHeight="22px" w="28px"  py="1px" ml="8px" mb="3px" bg="white"><Text textAlign="center" fontSize="12px">+8</Text></Box>

              </Flex>
          </Box>
        </Flex>
      </Box>
    </>
  )
}

export default OffersCard
