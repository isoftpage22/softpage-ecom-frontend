import React, { useState } from 'react'
import { Box, Button, Menu, MenuItem, HStack, Flex, Grid, Spacer, Text, IconButton, useDisclosure,Image, Divider } from '@chakra-ui/react'
import { ArrowBackIcon, AddIcon, WarningIcon, SearchIcon } from '@chakra-ui/icons'
import { useHistory } from 'react-router'
import { connect } from "react-redux";

import SearchBarDrawer from '../../../Container/SearchBarDrawer/SearchBarDrawer'


const CommonTopBar = ({ addToCart, getProductListOnSearch, urlParamObject }) => {
  const [toggleDrawer, setToggleDrawer] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const history = useHistory()
  const restaurant = "Mac Donalds"
  const restaurant2 = "Noida Sector 16"

  const fontSize = (length) => {
    if (length > 70) {
      return "17px"
    }
    if (length > 30 && length < 70) {
      return "20px"
    }
    if (length <= 10) {
      return "40px"
    }
    if (length > 10 && length < 30) {
      return "30px"
    }
  }
  var noData = "No data"
  return (
    <>
      <Flex bg="black" p="10px" h="80px" justify="space-around" alignItems="flex-">
        <Box textAlign="center" wordBreak="break-all" boxSizing="border-box" onClick={() => history.push('/')} as="p" fontSize={fontSize(restaurant)} fontWeight="700" alignSelf="center">
          <Flex >
            <Box border="1px" borderColor="gray.200" borderRadius="2">
            <Image boxSize="40px"
              src="https://cdn.dotpe.in/logo/504/mcd1.jpg" />
              </Box>
            <Flex direction="column" justifyContent="center" >
              <Text  
               color="white" 
               lineHeight="13px" 
               textAlign="left"
               fontSize="16px" 
               ml="5px"
               extTransform="capitalize">{restaurant}</Text>
              <Text  
               color="#777171" 
               lineHeight="15px" 
               textAlign="left"
               fontSize="13px" 
               ml="5px"
               textTransform="capitalize">{restaurant2}</Text>
            </Flex>
          </Flex>
        </Box>
        <Spacer />
        <Box alignSelf="center" mr="10px">
          <IconButton
            size="md"
            color="white"
            variant="ghost"
            onClick={() => setToggleDrawer(true)}
            colorScheme="transparent"
            aria-label="Search database"
            icon={<SearchIcon
              boxSize="1.5em"
            />} />
        </Box>
        <Box alignSelf="center" >
        </Box>
      </Flex>
      {/* <Divider/> */}
      <SearchBarDrawer toggleDrawer={toggleDrawer} setToggleDrawer={setToggleDrawer} />
    </>
  )
}
export default CommonTopBar;

