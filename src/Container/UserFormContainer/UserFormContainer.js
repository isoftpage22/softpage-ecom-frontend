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
  InputLeftElement,
  Icon,
  Button,
  InputGroup,
  Input,
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup, CheckboxGroup, Checkbox,
  InputRightElement,
} from "@chakra-ui/react"
import DrawerHeaderCustom from '../../Components/DrawerComp/DrawerHeaderCustom'
import { RiWhatsappFill } from "react-icons/ri";
import { PhoneIcon, AddIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons'


const UserFormContainer = (props) => {
  const { toggleDrawer, setToggleDrawer, userFormDrawerStatus, toggleUserFormDrawer } = props
  const willTriggerWhenDrawerClosed = () => {
    toggleUserFormDrawer(!userFormDrawerStatus)
  }
  return (
    <>
      <DrawerComp
        placement={'bottom'}
        bg="black"
        height="65vh"
        borderTopRightRadius='30px'
        borderTopLeftRadius="30px"
        onClose={() => willTriggerWhenDrawerClosed()}
        toggleDrawer={userFormDrawerStatus}
      >
        <DrawerHeader backgroundImage="url('https://cdn.dotpe.in/cfe/image/img-promo-banner-bg.png')"
          backgroundRepeat="no-repeat"
          backgroundSize="cover" borderTopRightRadius="30px" borderTopLeftRadius="30px"
          py="5px"
          px="8px"
          borderBottomWidth="1px">
          <DrawerHeaderCustom text="Confirm your WhatsApp number" />
        </DrawerHeader>
        <DrawerBody>

          <Stack spacing={4}>

            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <PhoneIcon color='gray.300' />
              </InputLeftElement>
              <Input placeholder='Customer Name' />
            </InputGroup>
            <InputGroup>
              <InputLeftElement w={8} h={8} children={<Icon color={'whatsapp.500'} h={20} mt={1} w={6} as={RiWhatsappFill} />} />
              <Input type='tel' placeholder='Whatsapp Number' />


            </InputGroup>

          </Stack>

        </DrawerBody>
      </DrawerComp>
    </>
  )
}

export default UserFormContainer