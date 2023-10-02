import React from 'react'
import {
 
  InputLeftElement,
  Icon,
  Button,
  InputGroup,
  
  Input,
  Stack,
  VStack,
  FormControl,
} from "@chakra-ui/react"
import { RiWhatsappFill } from "react-icons/ri";
import { PhoneIcon, AddIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons'
import InputErrorMessage from '../../Components/InputErrorMessage/InputErrorMessage';
const ContactFields = (props) => {
  const {formik,handleDigitsChange} = props
  return (
    <>
    <Stack spacing={8}>

<form onSubmit={formik.handleSubmit}>
  <VStack spacing={4} align="flex-start">
    <FormControl>

      <InputGroup mt={5}>
        <InputLeftElement pointerEvents='none'>
          <PhoneIcon mt={2} color='gray.300' />
        </InputLeftElement>
        <Input h={45} isInvalid={formik.touched.customerName &&  formik.errors.customerName} name="customerName" placeholder='Customer Name' onChange={(e)=>handleDigitsChange(e,20)}
          value={formik.values.customerName} />
      </InputGroup>
      {formik.errors.customerName && formik.touched.customerName  && <InputErrorMessage errorMessage={formik.errors.customerName}/>}

    </FormControl>

    <FormControl>

      <InputGroup>
        <InputLeftElement w={8} h={8} children={<Icon  color={'whatsapp.500'} h={20} mt={2} w={6} as={RiWhatsappFill} />} />
        <Input  h={45} isInvalid={ formik.touched.whatsAppNumber && formik.errors.whatsAppNumber} name='whatsAppNumber' type='tel' placeholder='Whatsapp Number' onChange={(e)=>handleDigitsChange(e,10)} value={formik.values.whatsAppNumber} />
      </InputGroup>
      {formik.errors.whatsAppNumber && formik.touched.whatsAppNumber && <InputErrorMessage errorMessage={formik.errors.whatsAppNumber}/>}

    </FormControl>

  <Button type='submit' variant="solidFull" bg="#f4c359" alignSelf="center" size="lg" >CONTINUE</Button> 

  </VStack>
</form>
</Stack>
    </>
  )
}

export default ContactFields