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
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup, CheckboxGroup, Checkbox,
} from "@chakra-ui/react"
import { ArrowBackIcon } from '@chakra-ui/icons'
// import { Button as NeumorphButton, Fab } from 'ui-neumorphism'


import DrawerComp from '../../Components/DrawerComp/DrawerComp';

const ProductCustomizationDrawer = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [placement, setPlacement] = React.useState("bottom")
const{children}=props
  return (
    <DrawerComp
      placement={'bottom'}
      bg="black"
      height="85vh"
      borderTopRightRadius='30px'
      borderTopLeftRadius="30px"
      toggleDrawer={false}
    >
      <>
        <DrawerHeader bg="#444" borderTopRightRadius="30px" borderTopLeftRadius="30px" borderBottomWidth="1px">
          <Flex direction="column" mt="16px" mr="33px" mb="12px">
            <Flex>
              <ArrowBackIcon w="20px" alignSelf="flex-end" color="white" />
              <Text ml="10px" color="white" lineHeight="19px" fontSize="16px" fontWeight="bold">{'Mc Aloo tikki'}</Text>
              <Box ml="10px" w="8px" h="8px" mb="10px" border="1px solid #E11010">
                <Box m="0.8px" mt="0.9px" w="4.4px" h="4.4px" bg="#EC1010" />
              </Box>
            </Flex>
            <Text ml="30px" mt="10px" fontSize="14px" lineHeight="17px"  color="white" >₹{'25'}</Text>
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <Flex direction="column">
            {children}
          </Flex>
        </DrawerBody>
        <DrawerFooter bg="#444" color="white" justifyContent="flex-start">
          <Flex color="white" justifyContent="space-between" w="100%" h="100%">
            <Text alignSelf="center" fontWeight="extrabold" color="white">Item Total | ₹450</Text>
            <Fab size='small' dark color='white' style={{ fontSize: '10px' }}>
              &nbsp;<span style={{ fontSize: '16px' }}>&#43;</span>&nbsp; <Text fontSize="10px" color="white">ADD TO CART</Text> &nbsp;
             </Fab>
          </Flex>
        </DrawerFooter>
      </>
    </DrawerComp>

  )
}

export default ProductCustomizationDrawer
