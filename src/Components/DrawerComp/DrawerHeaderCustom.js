import React, { Children } from 'react'
import { Box, Flex, Text, Image, Spacer } from '@chakra-ui/react'
import { ArrowBackIcon,CloseIcon } from '@chakra-ui/icons'
const DrawerHeaderCustom = (props) => {

  const { children, imgSrc = "https://cdn.dotpe.in/cfe/image/img-banner-gift.png", text,type="phone" , method,someArgs } = props

  const renderCustomHeader = (type) => {
    switch (type) {
      case 'phone':
        return   <> 
        {/* <ArrowBackIcon alignSelf="center" w="30px" h="2em" size="lg" /> */}
          <Box m="15px" alignSelf="center">
            <Text
              fontSize="20px"
            >
              {text}
            </Text>
          </Box>
          <Spacer />
            <CloseIcon onClick={()=> method(someArgs)} alignSelf="center" w="30px" h="1.5em" size="lg" />
        </>
        
        
       
        
       case 'OTP':
        return  <> <ArrowBackIcon  onClick={()=> method(someArgs)} alignSelf="center" w="30px" h="2em" size="lg" />
        <Box ml="5px" alignSelf="center">
          <Text
            fontSize="20px"
          >
            {text}
          </Text>
        </Box>
        <Spacer />
        <Box maxWidth="72px" minWidth="72px" maxHeight="72px" minHeight="72px">
          <Image maxHeight="100%" minHeight="100%" maxWidth="100%" minWidth="100%" src={imgSrc} />
        </Box>
      </>
       
      default:
          return  <> <ArrowBackIcon onClick={()=> method(someArgs)} alignSelf="center" w="30px" h="2em" size="lg" />
          <Box ml="5px" alignSelf="center">
            <Text
              fontSize="20px"
            >
              {text}
            </Text>
          </Box>
          <Spacer />
          <Box maxWidth="72px" minWidth="72px" maxHeight="72px" minHeight="72px">
            <Image maxHeight="100%" minHeight="100%" maxWidth="100%" minWidth="100%" src={imgSrc} />
          </Box>
        </>
    }
  }
  return (
    <>
      <Box>
        <Flex flexDir="column" minH="92px" alignSelf="center">
          <Box fontSize="14px" mt="10px" lineHeight="1.6" fontWeight="400" marginBottom="4px">
            <Flex>
              {renderCustomHeader(type)}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </>
  )
}

export default DrawerHeaderCustom
