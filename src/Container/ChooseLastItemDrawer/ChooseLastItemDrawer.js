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
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup, CheckboxGroup, Checkbox,
} from "@chakra-ui/react"
import { ArrowBackIcon } from '@chakra-ui/icons'
import Ripples from 'react-ripples'
import '../../Assets/CSS/ShoppingCart.css'
const ChooseLastItemDrawer = () => {
  return (
    <>
      <DrawerComp
        placement={'bottom'}
        bg="black"
        height="15vh"
        borderTopRightRadius='0px'
        borderTopLeftRadius="0px"
        toggleDrawer={true}>
        <DrawerHeader borderBottomWidth="1px">
        </DrawerHeader>
        <DrawerBody>
          <Flex justifyContent="space-evenly" alignItems="center">
            <Ripples className="ripple-display">
              <Box w="80%" m="auto" p="10px" bg="#28a745" color="white"><Text textAlign="center" color="white">I'LL CHOOSE</Text> </Box>
            </Ripples>
            <Ripples className="ripple-display">
              <Box w="80%" m="auto" p="10px" bg="#28a745" color="white"><Text textAlign="center" color="white">REPEAT LAST</Text></Box>
            </Ripples>
          </Flex>
        </DrawerBody>
      </DrawerComp>
    </>
  )
}

export default ChooseLastItemDrawer
