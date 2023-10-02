import React,{useState} from 'react'
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
  FormLabel,
  FormErrorMessage,
  Input,
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup, CheckboxGroup, Checkbox,
  InputRightElement,
  VStack,
  FormControl,
} from "@chakra-ui/react"
import DrawerHeaderCustom from '../../Components/DrawerComp/DrawerHeaderCustom'

import FormikControl from '../../Formik/FormikControl';
import { Formik, Field, useFormik } from "formik";
import FormikInput from '../../Formik/Input';
import * as Yup from "yup";
import InputErrorMessage from '../../Components/InputErrorMessage/InputErrorMessage';
import ContactFields from './ContactFields';
import OtpFields from './OtpFields';
import { method } from 'lodash';


const UserFormContainer = (props) => {
  const { toggleDrawer, setToggleDrawer, userFormDrawerStatus, toggleUserFormDrawer } = props
  const willTriggerWhenDrawerClosed = () => {
    toggleUserFormDrawer(!userFormDrawerStatus)
  }
 const submitOtp = ()=>{
   localStorage.setItem('CustomerInfo', JSON.stringify(formik.values))
   setscreen('mobile')
 }
 const [screen, setscreen] = useState('mobile')
  const validateSchema = Yup.object().shape({
    customerName: Yup.string().required("Name required *"),
    whatsAppNumber: Yup.string()
      .matches(/^\d{10}$/, 'WhatsApp number must be exactly 10 digits')
      .required('WhatsApp number is required *'),

  });
  const validateDigits = (values) => {
    const digitRegex = /^\d+$/;
    const errors = {};
  
    if (!digitRegex.test(values.whatsAppNumber) || values.whatsAppNumber.length > 10) {
      errors.whatsAppNumber = 'WhatsApp number must be a maximum of 10 digits.';
    }
  
    return errors;
  };
  const formik = useFormik({
    initialValues: {
      customerName: "",
      whatsAppNumber: "",
    },
    validationSchema: validateSchema,
    validateOnChange: true, 
    validateOnBlur: true,
    validate:validateDigits,
    onSubmit: (values, onSubmitProps) => {
      alert(JSON.stringify(values, null, 2));
      setscreen('otp')
    }
  });

  const handleDigitsChange = (event,lengthOfChar) => {
    const inputValue = event.target.value;

    // Check if the input has more than 10 digits
    if (inputValue.length <= lengthOfChar) {
      formik.handleChange(event); // Update the formik field value
    }
  };

  return (
    <>
      <DrawerComp
        placement={'bottom'}
        bg="black"
        height="55vh"
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
          { screen == "otp"? <DrawerHeaderCustom type="otp" method={setscreen} someArgs={'mobile'} text="Enter OTP" />
           :
          <DrawerHeaderCustom  type="phone" method={toggleUserFormDrawer} someArgs={!userFormDrawerStatus}  text="Confirm your WhatsApp number" />
          }
        </DrawerHeader>
        <DrawerBody>

          { screen == "otp"?  <OtpFields setscreen={setscreen} someArgs={'phone'} submitOtp={submitOtp} />
                   
          :         
           <ContactFields setscreen={setscreen} formik={formik} handleDigitsChange={handleDigitsChange}/>

         }

        </DrawerBody>
      </DrawerComp>
    </>
  )
}

export default UserFormContainer