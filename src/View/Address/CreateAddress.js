import React, { useState, useRef } from 'react'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import { Box, Button, Flex, Text, FormControl, FormLabel, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'
import * as Yup from "yup";
import { useFormik } from "formik";
import { AiFillHome } from "react-icons/ai";
import { MdWork, MdPlace, MdHotel } from 'react-icons/md'
import ContinueButton from './Components/ContinueButton';
import { generateUniqueRandomString, getAddressOnBasisOfId, getAdrresFromLocal, getUserInFromLocal } from '../../utils/CommonFunctions';
import { LOCAL_STORAGE_CUSTOMER_ADDRESS } from '../../utils/constants';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import {saveUsersAddress } from '../../Store/action/addresses';
import { useHistory } from '../../lib/nav';
import { useParams } from 'next/navigation';
import { AddressMapPicker } from '../../Components/AddressMapPicker/AddressMapPicker';
import { useCreateAddressMutation, useUpdateAddressMutation } from '@/store/api/storefrontAuthApi';
import { inferLabelType, labelFromType, localAddressToApiInput } from '@/lib/checkout/addressMapping';
import { isValidCoordPair, toCoord } from '@/lib/geo/coords';
import { rtkErrorMessage } from '@/lib/auth/persistAuth';
import { useRequireStorefrontAuth } from '@/lib/auth/useRequireStorefrontAuth';

const CHIP_ICONS = {
  HOME: <AiFillHome />,
  WORK: <MdWork />,
  HOTEL: <MdHotel />,
  OTHER: <MdPlace />,
}

const fieldStyle = {
  h: "48px",
  bg: "white",
  border: "1px solid",
  borderColor: "#D4D4D8",
  borderRadius: "10px",
  fontSize: "14px",
  _placeholder: { color: "#A1A1AA" },
  _focus: {
    bg: "white",
    borderColor: "var(--brand-secondary, #111)",
    boxShadow: "0 0 0 1px var(--brand-secondary, #111)",
  },
}

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#3F3F46",
  mb: "6px",
  letterSpacing: "0",
  textTransform: "none",
}

function nationalPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "")
  if (digits.startsWith("91") && digits.length > 10) return digits.slice(-10)
  return digits.slice(0, 10)
}

const CreateAddress = (props) => {
  const params = useParams()
  const id = params?.id
   const history = useHistory()
  const isEdit  = id?true:false
  const { loggedIn, promptLogin } = useRequireStorefrontAuth(isEdit && id ? `/edit-address/${id}` : "/create-address")
  const [currentAddres, setCurrentAdrres] = useState(getAddressOnBasisOfId(id))
  const profile = (() => {
    const customer = getUserInFromLocal()
    return Array.isArray(customer) ? {} : customer
  })()

  const initialLabelType = inferLabelType(currentAddres || {})
  const [selectedLabelType, setSelectedLabelType] = useState(initialLabelType)
  const [submitError, setSubmitError] = useState('')
  const [outOfZone, setOutOfZone] = useState(false)
  const outOfZoneRef = useRef(false)

   
  const validateSchema = Yup.object().shape({
    houseNumber: Yup.string().trim().required("required *"),
    floor: Yup.string().trim().required("required *"),
    tower: Yup.string().trim().required("required *"),
    societyName: Yup.string().trim().required("required *"),
    address1: Yup.string().required("Pin a location on the map"),
    pincode: Yup.string().required('required *'),
    fullName: Yup.string().trim().required("required *"),
  });
  const validateOtherType = (values) => {
    const errors = {};
    const digitRegex = /^\d+$/;

    if (values.labelType === "OTHER" && !String(values.addressType || "").trim()) {
      errors.addressType = "Required";
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
      houseNumber: currentAddres?.houseNumber ?? '',
      floor: currentAddres?.floor ?? '',
      tower: currentAddres?.tower ?? '',
      societyName: currentAddres?.societyName ?? '',
      pincode: currentAddres?.pincode ?? '',
      landmark: currentAddres?.landmark ?? '',
      checkbox: currentAddres?.checkbox ?? labelFromType(initialLabelType, currentAddres?.addressType),
      labelType: initialLabelType,
      addressType: currentAddres?.addressType ?? '',
      city: currentAddres?.city ?? '',
      state: currentAddres?.state ?? '',
      country: currentAddres?.country ?? 'India',
      latitude: currentAddres?.latitude ?? '',
      longitude: currentAddres?.longitude ?? '',
      fullName: currentAddres?.fullName || profile?.customerName || '',
      phone: nationalPhone(currentAddres?.phone || profile?.whatsAppNumber),
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
      const payload = {
        ...values,
        checkbox: labelFromType(values.labelType, values.addressType),
        phone: nationalPhone(values.phone),
      };
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

    if (inputValue.length <= lengthOfChar) {
      formik.handleChange(event);
    }
  };
  const handleLabelTypeChange = (type) => {
    setSelectedLabelType(type)
    formik.setFieldValue("labelType", type)
    formik.setFieldValue("checkbox", labelFromType(type, formik.values.addressType))
  }

  const typeChip = (type, label, icon) => {
    const active = selectedLabelType === type
    return (
      <Button
        type="button"
        onClick={() => handleLabelTypeChange(type)}
        flex="1"
        minW="72px"
        h="42px"
        leftIcon={icon}
        fontSize="13px"
        fontWeight="600"
        textTransform="none"
        letterSpacing="0"
        borderRadius="999px"
        border="1.5px solid"
        borderColor={active ? "var(--brand-secondary, #111)" : "#E4E4E7"}
        bg={active ? "var(--brand-secondary, #111)" : "white"}
        color={active ? "white" : "#3F3F46"}
        _hover={{ bg: active ? "var(--brand-secondary, #111)" : "#F4F4F5" }}
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
              if (addr.houseNumber !== undefined) formik.setFieldValue('houseNumber', addr.houseNumber);
              if (addr.floor !== undefined) formik.setFieldValue('floor', addr.floor);
              if (addr.tower !== undefined) formik.setFieldValue('tower', addr.tower);
              if (addr.societyName !== undefined) formik.setFieldValue('societyName', addr.societyName);
              if (addr.landmark !== undefined) formik.setFieldValue('landmark', addr.landmark);
            }}
          />
          {submitError ? (
            <Text fontSize="13px" color="red.600" mb={3} letterSpacing="0" textTransform="none">{submitError}</Text>
          ) : null}

          <FormControl mb="14px">
            <FormLabel {...labelStyle}>Area</FormLabel>
            <Input
              {...fieldStyle}
              name="address1"
              value={formik.values.address1}
              placeholder="Filled from the map pin"
              isReadOnly
              bg="#F4F4F5"
              cursor="default"
            />
          </FormControl>

          <Flex direction="column" gap="14px">
            <FormControl>
              <FormLabel {...labelStyle}>Save address as *</FormLabel>
              <Flex gap="8px" wrap="wrap">
                {typeChip("HOME", "Home", CHIP_ICONS.HOME)}
                {typeChip("WORK", "Work", CHIP_ICONS.WORK)}
                {typeChip("HOTEL", "Hotel", CHIP_ICONS.HOTEL)}
                {typeChip("OTHER", "Other", CHIP_ICONS.OTHER)}
              </Flex>
            </FormControl>

            {selectedLabelType === "OTHER" ? (
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

            <FormControl>
              <FormLabel {...labelStyle}>House number *</FormLabel>
              <Input
                {...fieldStyle}
                isInvalid={formik.touched.houseNumber && formik.errors.houseNumber}
                name="houseNumber"
                placeholder="D7 305"
                onChange={(e) => handleDigitsChange(e, 100)}
                value={formik.values.houseNumber}
              />
              {formik.errors.houseNumber && formik.touched.houseNumber ? (
                <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.houseNumber}</Text>
              ) : null}
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyle}>Floor *</FormLabel>
              <Input
                {...fieldStyle}
                isInvalid={formik.touched.floor && formik.errors.floor}
                name="floor"
                placeholder="3"
                onChange={(e) => handleDigitsChange(e, 50)}
                value={formik.values.floor}
              />
              {formik.errors.floor && formik.touched.floor ? (
                <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.floor}</Text>
              ) : null}
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyle}>Tower / Block *</FormLabel>
              <Input
                {...fieldStyle}
                isInvalid={formik.touched.tower && formik.errors.tower}
                name="tower"
                placeholder="D7"
                onChange={(e) => handleDigitsChange(e, 100)}
                value={formik.values.tower}
              />
              {formik.errors.tower && formik.touched.tower ? (
                <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.tower}</Text>
              ) : null}
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyle}>Society name *</FormLabel>
              <Input
                {...fieldStyle}
                isInvalid={formik.touched.societyName && formik.errors.societyName}
                name="societyName"
                placeholder="Amrapali Riverview"
                onChange={(e) => handleDigitsChange(e, 150)}
                value={formik.values.societyName}
              />
              {formik.errors.societyName && formik.touched.societyName ? (
                <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.societyName}</Text>
              ) : null}
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyle}>Nearby landmark (optional)</FormLabel>
              <Input
                {...fieldStyle}
                name="landmark"
                placeholder="Opposite the park"
                onChange={(e) => handleDigitsChange(e, 150)}
                value={formik.values.landmark}
              />
            </FormControl>

            {formik.errors.address1 && formik.touched.address1 ? (
              <Text fontSize="12px" color="red.500">{formik.errors.address1}</Text>
            ) : null}
            {formik.errors.pincode && formik.touched.pincode ? (
              <Text fontSize="12px" color="red.500">{formik.errors.pincode}</Text>
            ) : null}

            <Text mt="8px" fontSize="14px" fontWeight="600" color="#18181B" letterSpacing="0" textTransform="none">
              Enter your details for seamless delivery experience
            </Text>

            <FormControl>
              <FormLabel {...labelStyle}>Your name *</FormLabel>
              <Input
                {...fieldStyle}
                isInvalid={formik.touched.fullName && formik.errors.fullName}
                name="fullName"
                placeholder="Sharad"
                onChange={(e) => handleDigitsChange(e, 150)}
                value={formik.values.fullName}
              />
              {formik.errors.fullName && formik.touched.fullName ? (
                <Text mt="4px" fontSize="11px" color="red.500">{formik.errors.fullName}</Text>
              ) : null}
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyle}>Your phone number (optional)</FormLabel>
              <InputGroup>
                <InputLeftAddon
                  h="48px"
                  bg="white"
                  borderColor="#D4D4D8"
                  color="#52525B"
                  fontSize="14px"
                  fontWeight="600"
                >
                  +91
                </InputLeftAddon>
                <Input
                  {...fieldStyle}
                  borderLeftRadius="0"
                  name="phone"
                  inputMode="numeric"
                  placeholder="8588913958"
                  onChange={(e) => {
                    const next = nationalPhone(e.target.value)
                    formik.setFieldValue("phone", next)
                  }}
                  value={formik.values.phone}
                />
              </InputGroup>
            </FormControl>
          </Flex>
        </Box>
        <ContinueButton text="Save Address" isDisabled={outOfZone} onClick={() => formik.handleSubmit()} />
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
