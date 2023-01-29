import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup,CheckboxGroup,Checkbox,
} from "@chakra-ui/react"
import { ArrowBackIcon } from '@chakra-ui/icons'

const DrawerComp = (props) => {
  // const { isOpen, onOpen, onClose } = useDisclosure()
  // const [placement, setPlacement] = React.useState("bottom")
  const {placement,isOpen,onClose,bg,height,borderTopRightRadius,borderTopLeftRadius,children,toggleDrawer}=props
  return (
    <>
      <Drawer  scrollBehavior="inside" placement={placement} onClose={onClose} isOpen={toggleDrawer}>
        <DrawerOverlay />
        <DrawerContent  h={height} borderTopRightRadius={borderTopRightRadius}borderTopLeftRadius={borderTopLeftRadius}  >
         {children}
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default DrawerComp
