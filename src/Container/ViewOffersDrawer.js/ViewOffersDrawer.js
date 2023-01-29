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
  Icon,
  Button,
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup, CheckboxGroup, Checkbox,
} from "@chakra-ui/react"
import { ArrowBackIcon } from '@chakra-ui/icons'
import { MdLocalOffer } from "react-icons/md";
import Ripples from 'react-ripples'
// import '../../Assets/CSS/ShoppingCart.css'
import BasicTextAndImageComponent from '../../Components/BasicTextAndImageComponent/BasicTextAndImageComponent'
import HeaderOfOffersDrawer from './HeaderOfOffersDrawer'
import BasicTextAndImageContainer from '../BasicTextAndImageContainer/BasicTextAndImageContainer';
const ViewOffersDrawer = ({toggleDrawer,setToggleDrawer}) => {
  const willTriggerWhenDrawerClosed=()=>{
    console.log("closed")
    setToggleDrawer(!toggleDrawer)
  }
  let image="https://images.unsplash.com/photo-1555274175-75f4056dfd05?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80"  
  return (
    <>
      <DrawerComp
        placement={'bottom'}
        bg="black"
        height="65vh"
        borderTopRightRadius='30px'
        borderTopLeftRadius="30px"
        onClose={()=>willTriggerWhenDrawerClosed()}
        toggleDrawer={toggleDrawer}
        >
        <DrawerHeader   backgroundImage="url('https://cdn.dotpe.in/cfe/image/img-promo-banner-bg.png')"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"  borderTopRightRadius="30px" borderTopLeftRadius="30px" 
        py="5px"
        px="8px"
        borderBottomWidth="1px">
        <HeaderOfOffersDrawer/>
        </DrawerHeader>
        <DrawerBody>
          {/* BasicTextAndImageComponent */}
        <BasicTextAndImageContainer image={image}/>
        <BasicTextAndImageContainer image={image}/>
        <BasicTextAndImageContainer image={image}/>
        <BasicTextAndImageContainer image={image}/>
        <BasicTextAndImageContainer image={image}/>

        </DrawerBody>
      </DrawerComp>
    </>
  )
}

export default ViewOffersDrawer
