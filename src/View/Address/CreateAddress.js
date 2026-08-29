import React, { useState, useRef } from 'react'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import { Box, Button, Flex, Text, FormControl, FormLabel, Input } from '@chakra-ui/react'
import * as Yup from "yup";
import { useFormik } from "formik";
import { AiFillHome } from "react-icons/ai";
import { MdWork, MdPlace } from 'react-icons/md'
import ContinueButton from './Components/ContinueButton';
import { generateUniqueRandomString, getAddressOnBasisOfId, getAdrresFromLocal } from '../../utils/CommonFunctions';
import { LOCAL_STORAGE_CUSTOMER_ADDRESS } from '../../utils/constants';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import {saveUsersAddress } from '../../Store/action/addresses';
import { useHistory } from '../../lib/nav';
import { useParams } from 'next/navigation';
import { AddressMapPicker } from '../../Components/AddressMapPicker/AddressMapPicker';
import { useCreateAddressMutation, useUpdateAddressMutation } from '@/store/api/storefrontAuthApi';
import { localAddressToApiInput } from '@/lib/checkout/addressMapping';
import { getUserInFromLocal } from '../../utils/CommonFunctions';
import { isValidCoordPair, toCoord } from '@/lib/geo/coords';
import { rtkErrorMessage } from '@/lib/auth/persistAuth';
import { useRequireStorefrontAuth } from '@/lib/auth/useRequireStorefrontAuth';

const fieldStyle = {
  h: "44px",
  bg: "#F4F4F5",
  border: "1px solid",
  borderColor: "#E4E4E7",
  borderRadius: "10px",
  fontSize: "14px",
  _placeholder: { color: "#A1A1AA" },
  _focus: { bg: "white", borderColor: "#111", boxShadow: "none" },
}

const labelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#71717A",
  letterSpacing: "0.04em",
  mb: "6px",
  textTransform: "uppercase",
}

const CreateAddress = (props) => {
  const params = useParams()
  const id = params?.id
   const history = useHistory()
  const isEdit  = id?true:false
  const { loggedIn, promptLogin } = useRequireStorefrontAuth(isEdit && id ? `/edit-address/${id}` : "/create-address")
  const [currentAddres, setCurrentAdrres] = useState(getAddressOnBasisOfId(id))

  const [selectedAddressType, setselectedAddressType] = useState(currentAddres?.checkbox ?? 'Home')
  const [submitError, setSubmitError] = useState('')
  const [outOfZone, setOutOfZone] = useState(false)
  const outOfZoneRef = useRef(false)

   
  const validateSchema = Yup.object().shape({
    address1: Yup.string().required("required *"),
    pincode: Yup.string().required('required *'),
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
  const [createAddress] = useCreateAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();

  const formik = useFormik({
    initialValues: {
      id: currentAddres?.id ?? generateUniqueRandomString(),
      address1: currentAddres?.address1 ?? '',
      address2: currentAddres?.address2 ?? '',
      pincode: currentAddres?.pincode ?? '',
      landmark: currentAddres?.landmark ?? '',
      checkbox:  currentAddres?.checkbox ?? selectedAddressType,
      addressType: currentAddres?.addressType ?? '',
      city: currentAddres?.city ?? '',
      state: currentAddres?.state ?? '',
      country: currentAddres?.country ?? 'India',
      latitude: currentAddres?.latitude ?? '',
      longitude: currentAddres?.longitude ?? '',
    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validate: validateOtherType,
    onSubmit: async (values) => {
      setSubmitError('')
      if (!isValidCoordPair(values.latitude, values.longitude)) {
        setSubmitError('Set a pin on the map so we can deliver to this address.')
        return
      }
      if (outOfZoneRef.current) {
        setSubmitError('This address is outside the restaurant delivery area.')
        return
      }
      const customer = getUserInFromLocal();
      const payload = { ...values };
      try {
        if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
          const input = localAddressToApiInput(payload, Array.isArray(customer) ? {} : customer);
          if (id && currentAddres?.serverId) {
            await updateAddress({ id: Number(currentAddres.serverId), data: input }).unwrap();
          } else {
            const saved = await createAddress(input).unwrap();
            if (saved?.id) payload.serverId = saved.id;
          }
        }
      } catch (err) {
        setSubmitError(rtkErrorMessage(err, 'Could not save address to your profile. It was kept on this device.'));
      }
      if (id) {
        let addresses = getAdrresFromLocal();
        let index = addresses.findIndex((addKey) => addKey.id == id);
        if (index >= 0) addresses[index] = payload;
        else addresses.push(payload);
        localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(addresses));
        history.replace('/addresses');
      } else {
        let address = getAdrresFromLocal();
        address.push(payload);
        localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(address));
        history.replace('/addresses');
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
  const handleAddressTypeChange = (type) => {
    setselectedAddressType(type)
    formik.setFieldValue("checkbox", type)
  }

  const typeChip = (type, label, icon) => {
    const active = selectedAddressType === type
    return (
      <Button
        type="button"
        onClick={() => handleAddressTypeChange(type)}
        flex="1"
        h="42px"
        leftIcon={icon}
        fontSize="13px"
        fontWeight="600"
        textTransform="none"
        letterSpacing="0"
        borderRadius="10px"
        border="1px solid"
        borderColor={active ? "#111" : "#E4E4E7"}
        bg={active ? "#111" : "white"}
        color={active ? "white" : "#3F3F46"}
        _hover={{ bg: active ? "#111" : "#F4F4F5" }}
      >
        {label}
      </Button>
    )
  }

  return (
    <>
      <TopBarWithBackButton headerText={isEdit ? "Edit address" : "Add address"} />
      {!loggedIn ? (
        <Flex direction="column" align="center" px={6} pt={10} gap={4}>
          <Text color="gray.600" textAlign="center" letterSpacing="0" textTransform="none">
            Log in to add a delivery address.
          </Text>
          <Button onClick={promptLogin} w="100%" textTransform="none">
            Log in
          </Button>
        </Flex>
      ) : (
      <form onSubmit={formik.handleSubmit}>
        <Box px="16px" pt="12px" pb="96px">
          <AddressMapPicker
            value={{
              line1: formik.values.address1,
              city: formik.values.city,
              state: formik.values.state,
              pincode: formik.values.pincode,
              country: formik.values.country,
              lat: isValidCoordPair(formik.values.latitude, formik.values.longitude)
                ? toCoord(formik.values.latitude)
                : null,
              lng: isValidCoordPair(formik.values.latitude, formik.values.longitude)
                ? toCoord(formik.values.longitude)
                : null,
            }}
            onFence={(fence) => {
              const next = Boolean(fence && fence.reason === 'out_of_zone')
              outOfZoneRef.current = next
              setOutOfZone(next)
            }}
            onChange={(addr) => {
              formik.setFieldValue('address1', addr.line1 || formik.values.address1);
              formik.setFieldValue('city', addr.city || '');
              formik.setFieldValue('state', addr.state || '');
              formik.setFieldValue('pincode', addr.pincode || formik.values.pincode);
              formik.setFieldValue('country', addr.country || 'India');
              formik.setFieldValue('latitude', addr.lat);
              formik.setFieldValue('longitude', addr.lng);
            }}
          />
          {submitError ? (
            <Text fontSize="13px" color="red.600" mb={3} letterSpacing="0" textTransform="none">{submitError}</Text>
          ) : null}

          <Flex direction="column" gap="14px">
            <FormControl>
              <FormLabel {...labelStyle}>House / street</FormLabel>
              <Input
                {...fieldStyle}
                isInvalid={formik.touched.address1 && formik.errors.address1}
                name="address1"
                placeholder="Flat, building, street"
                onChange={(e) => handleDigitsChange(e, 250)}
                value={formik.values.address1}
              />
              {formik.errors.address1 && formik.touched.address1 ? (
                <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.address1}</Text>
              ) : null}
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyle}>Area / locality</FormLabel>
              <Input
                {...fieldStyle}
                name="address2"
                placeholder="Optional"
                onChange={(e) => handleDigitsChange(e, 250)}
                value={formik.values.address2}
              />
            </FormControl>

            <Flex gap="12px">
              <FormControl>
                <FormLabel {...labelStyle}>Pincode</FormLabel>
                <Input
                  {...fieldStyle}
                  isInvalid={formik.touched.pincode && formik.errors.pincode}
                  name="pincode"
                  inputMode="numeric"
                  placeholder="6 digits"
                  onChange={(e) => handleDigitsChange(e, 6)}
                  value={formik.values.pincode}
                />
                {formik.errors.pincode && formik.touched.pincode ? (
                  <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.pincode}</Text>
                ) : null}
              </FormControl>
              <FormControl>
                <FormLabel {...labelStyle}>Landmark</FormLabel>
                <Input
                  {...fieldStyle}
                  name="landmark"
                  placeholder="Optional"
                  onChange={(e) => handleDigitsChange(e, 40)}
                  value={formik.values.landmark}
                />
              </FormControl>
            </Flex>

            <Flex gap="12px">
              <FormControl>
                <FormLabel {...labelStyle}>City</FormLabel>
                <Input
                  {...fieldStyle}
                  name="city"
                  placeholder="City"
                  onChange={(e) => handleDigitsChange(e, 80)}
                  value={formik.values.city}
                />
              </FormControl>
              <FormControl>
                <FormLabel {...labelStyle}>State</FormLabel>
                <Input
                  {...fieldStyle}
                  name="state"
                  placeholder="State"
                  onChange={(e) => handleDigitsChange(e, 80)}
                  value={formik.values.state}
                />
              </FormControl>
            </Flex>

            <FormControl>
              <FormLabel {...labelStyle}>Save as</FormLabel>
              <Flex gap="8px">
                {typeChip("Home", "Home", <AiFillHome />)}
                {typeChip("Work", "Work", <MdWork />)}
                {typeChip("Other", "Other", <MdPlace />)}
              </Flex>
            </FormControl>

            {selectedAddressType === "Other" ? (
              <FormControl>
                <FormLabel {...labelStyle}>Custom label</FormLabel>
                <Input
                  {...fieldStyle}
                  isInvalid={formik.touched.addressType && formik.errors.addressType}
                  name="addressType"
                  placeholder="Friends, PG, Office…"
                  onChange={(e) => handleDigitsChange(e, 20)}
                  value={formik.values.addressType}
                />
                {formik.errors.addressType && formik.touched.addressType ? (
                  <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.addressType}</Text>
                ) : null}
              </FormControl>
            ) : null}
          </Flex>
        </Box>
        <ContinueButton text={isEdit ? "Save address" : "Save address"} isDisabled={outOfZone} onClick={() => formik.handleSubmit()} />
      </form>
      )}
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
