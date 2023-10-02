import React, { useState } from 'react'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import { Box, Button, Stack, Flex, Text, VStack, FormControl, InputGroup, Grid, InputLeftElement, Input, GridItem } from '@chakra-ui/react'
import * as Yup from "yup";
import { Formik, Field, useFormik } from "formik";
import { PhoneIcon, AddIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons'
import InputErrorMessage from '../../Components/InputErrorMessage/InputErrorMessage';
import { AiFillHome } from "react-icons/ai";
import { MdWork } from 'react-icons/md'
import ContinueButton from './Components/ContinueButton';
import { generateUniqueRandomString, getAddressOnBasisOfId, getAdrresFromLocal } from '../../utils/CommonFunctions';
import { LOCAL_STORAGE_CUSTOMER_ADDRESS } from '../../utils/constants';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import {saveUsersAddress } from '../../Store/action/addresses';

const CreateAddress = (props) => {
  const id = props.match.params.id
   const history =props.history
  const isEdit  = id?true:false
  const [currentAddres, setCurrentAdrres] = useState(getAddressOnBasisOfId(id))

  const [selectedAddressType, setselectedAddressType] = useState(currentAddres?.checkbox ?? 'Home')

   
  const validateSchema = Yup.object().shape({
    address1: Yup.string().required("required *"),
    address2: Yup.string().required('required *'),
    pincode: Yup.string().required('required *'),
    landmark: Yup.string().required('required *'),


  });
  const validateOtherType = (values) => {
    const errors = {};
    const digitRegex = /^\d+$/;

    // Check if the checkbox is selected
    if (values.checkbox == "Other") {
      // Validate the inputField when the checkbox is selected
      if (!values.addressType) {
        errors.addressType = "Required";
      }
    }
    else if (!digitRegex.test(values.pincode) || values.pincode.length > 6){
      errors.pincode = 'Pincode must be a maximum of 6 digits.';

    }

    return errors;
  };
  const formik = useFormik({
    initialValues: {
      id: currentAddres?.id ?? generateUniqueRandomString(),
      address1: currentAddres?.address1 ?? '',
      address2: currentAddres?.address2 ?? '',
      pincode: currentAddres?.pincode ?? '',
      landmark: currentAddres?.landmark ?? '',
      checkbox:  currentAddres?.checkbox ?? selectedAddressType,
      addressType: currentAddres?.addressType ?? '',

    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validate: validateOtherType,
    onSubmit: (values, onSubmitProps) => {
       if(id){
         let addresses = getAdrresFromLocal()
         let index = addresses.findIndex((addKey,index)=>addKey.id == id)
         addresses[index] = values
         localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(addresses))
         history.replace('/addresses')
          
       }else{
        let address = getAdrresFromLocal()
        
        address.push(values)
        localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(address))
        history.replace('/addresses')

       }
    }
  });


  const handleDigitsChange = (event, lengthOfChar) => {
    const inputValue = event.target.value;

    // Check if the input has more than 10 digits
    if (inputValue.length <= lengthOfChar) {
      formik.handleChange(event); // Update the formik field value
    }
  };
  const handleAddressTypeChange = (type, event, lengthOfChar) => {
    setselectedAddressType(type)
    formik.setFieldValue("checkbox", type)
  }
  return (
    <>
    {console.log(currentAddres,"currentAddres",id,"checkA",props)}
      <TopBarWithBackButton headerText={'Create Address'} />
      <form onSubmit={formik.handleSubmit}>

        <Grid templateRows='repeat(5, 1fr)' templateColumns={'1fr 1fr'} h={"100%"} >
          <GridItem p={3} colSpan={2} w='100%' >
            <FormControl>
              <Input h={45} isInvalid={formik.touched.address1 && formik.errors.address1} name="address1" placeholder='Address Line 1 *' onChange={(e) => handleDigitsChange(e, 250)}
                value={formik.values.address1} />
              {formik.errors.address1 && formik.touched.address1 && <InputErrorMessage errorMessage={formik.errors.address1} />}
            </FormControl>
          </GridItem>
          <GridItem p={3} colSpan={2} w='100%' >
            <FormControl>
              <Input h={45} isInvalid={formik.touched.address2 && formik.errors.address2} name="address2" placeholder='Address Line 2 *' onChange={(e) => handleDigitsChange(e, 250)}
                value={formik.values.address2} />
              {formik.errors.address2 && formik.touched.address2 && <InputErrorMessage errorMessage={formik.errors.address2} />}
            </FormControl>
          </GridItem>
          <GridItem p={3} w='100%' >
            <FormControl>
              <Input h={45} isInvalid={formik.touched.pincode && formik.errors.pincode} name="pincode" placeholder='Pincode' onChange={(e) => handleDigitsChange(e, 6)}
                value={formik.values.pincode} />
              {formik.errors.pincode && formik.touched.pincode && <InputErrorMessage errorMessage={formik.errors.pincode} />}
            </FormControl>
          </GridItem>
          <GridItem p={3} w='100%' >
            <FormControl>
              <Input h={45} isInvalid={formik.touched.landmark && formik.errors.landmark} name="landmark" placeholder='Landmark' onChange={(e) => handleDigitsChange(e, 20)}
                value={formik.values.landmark} />
              {formik.errors.landmark && formik.touched.landmark && <InputErrorMessage errorMessage={formik.errors.landmark} />}
            </FormControl>

          </GridItem>

          <GridItem p={3} colSpan={2} rowSpan={2} w='100%' >
            <FormControl>
              <Text my={2}>ADDRESS TYPE</Text>
              <Stack direction='row' spacing={4} justifyContent={"center"}>
                <Button
                  focusBorderColor="none"
                  focusBoxShadow="none"
                  activeColor="black"
                  onClick={() => handleAddressTypeChange('Home')}
                  fontSize={12}
                  w={"25%"}
                  h={"100%"}
                  p={2}
                  size={16}
                  leftIcon={<AiFillHome />}
                  variant={`${selectedAddressType == "Home" ? 'outline' : 'outlineGhost'}`}>

                  Home
                </Button>
                <Button
                  focusBorderColor="none" focusBoxShadow="none"
                  onClick={() => handleAddressTypeChange('Work')}
                  fontSize={12}
                  w={"25%"}
                  h={"100%"}
                  p={2}
                  size={16}
                  leftIcon={<MdWork />}
                  colorScheme='blue'
                  variant={`${selectedAddressType == "Work" ? 'outline' : 'outlineGhost'}`}>
                  Work
                </Button>
                <Button
                  focusBorderColor="none" focusBoxShadow="none"
                  onClick={() => handleAddressTypeChange('Other')}
                  fontSize={12}
                  w={"25%"}
                  h={"100%"}
                  p={2}
                  size={16}
                  leftIcon={<MdWork />}
                  colorScheme='blue'
                  variant={`${selectedAddressType == "Other" ? 'outline' : 'outlineGhost'}`}>
                  Other's
                </Button>
              </Stack>
            </FormControl>
            <FormControl mt={3} h={46}>
              <>
                {selectedAddressType == "Other" ?
                  <>
                    <Input h={45} isInvalid={formik.touched.addressType && formik.errors.addressType} name="addressType" placeholder='Address Type (eg: Work,Home)' onChange={(e) => handleDigitsChange(e, 20)}
                      value={formik.values.addressType} />
                    <>
                      {formik.errors.addressType && formik.touched.addressType && <InputErrorMessage errorMessage={formik.errors.addressType} />}
                    </>
                  </>
                  : null} </>
            </FormControl>
            <ContinueButton text="CREATE" onClick={() => formik.handleSubmit()} />
          </GridItem>
        </Grid>
      </form>
    </>
  )
}
function mapStateToProps(state, props) {
  return {
    usersAddress:state.address.address,
    


  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    saveUsersAddress    
  }, dispatch);
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateAddress);
