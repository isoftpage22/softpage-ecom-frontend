import React from 'react'
import { Box, Flex, Text, Image, Spacer } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
const HeaderOfOffersDrawer = () => {
  return (
    <>
      <Box>
        <Flex flexDir="column"  minH="92px" alignSelf="center">
          <Box fontSize="14px" mt="10px" lineHeight="1.6" fontWeight="400" marginBottom="4px">
            <Flex>
              <ArrowBackIcon alignSelf="center" w="30px" h="2em" size="lg"/>
              <Box ml="5px" alignSelf="center">
                <Text
                  fontSize="20px"
                >
                  Offers
             </Text>
              </Box>
              <Spacer/>
              <Box maxWidth="72px" minWidth="72px" maxHeight="72px" minHeight="72px">
                <Image maxHeight="100%" minHeight="100%" maxWidth="100%" minWidth="100%" src={"https://cdn.dotpe.in/cfe/image/img-banner-gift.png"} />
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </>
  )
}

export default HeaderOfOffersDrawer
