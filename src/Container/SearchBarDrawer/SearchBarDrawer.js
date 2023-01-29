import React from 'react'
import DrawerComp from '../../Components/DrawerComp/DrawerComp'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup, CheckboxGroup, Checkbox, InputGroup, Input, InputRightElement
} from "@chakra-ui/react"
import { ArrowBackIcon, SearchIcon } from '@chakra-ui/icons'
import Ripples from 'react-ripples'
import '../../Assets/CSS/ShoppingCart.css'
const SearchBarDrawer = ({ toggleDrawer, setToggleDrawer }) => {
  const getProductListOnSearch = (value) => {
    console.log(value, "value")
  }
  const willTriggerWhenDrawerClosed=()=>{
    console.log("closed")
    setToggleDrawer(!toggleDrawer)
  }
  return (
    <>
      <DrawerComp
        placement={'top'}
        bg="black"
        height="15vh"
        borderTopRightRadius='0px'
        borderTopLeftRadius="0px"
        onClose={()=>willTriggerWhenDrawerClosed()}
        toggleDrawer={toggleDrawer}>
        <DrawerHeader >
          <DrawerCloseButton mb={2} onClick={()=>setToggleDrawer(!toggleDrawer)}/>
        </DrawerHeader>
        <DrawerBody>
          <InputGroup mt={5} mb={5}>
            <Input placeholder="Search...." onChange={(e) => getProductListOnSearch(e.target.value)} />
            <InputRightElement children={<SearchIcon />} />
          </InputGroup>
        </DrawerBody>
      </DrawerComp>
    </>
  )
}

export default SearchBarDrawer
