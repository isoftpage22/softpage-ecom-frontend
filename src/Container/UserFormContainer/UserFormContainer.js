import React, { useState } from "react";
import { DrawerBody, DrawerHeader, Text } from "@chakra-ui/react";
import DrawerComp from "../../Components/DrawerComp/DrawerComp";
import DrawerHeaderCustom from "../../Components/DrawerComp/DrawerHeaderCustom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ContactFields from "./ContactFields";
import OtpFields from "./OtpFields";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import {
  useSignupInfoMutation,
  useSendOtpMutation,
  useStorefrontLoginMutation,
  useStorefrontRegisterMutation,
} from "@/store/api/storefrontAuthApi";
import {
  persistStorefrontAuth,
  rtkErrorMessage,
  isRegistrationRequired,
  consumePostAuthRedirect,
} from "@/lib/auth/persistAuth";
import { useHistory } from "@/src/lib/nav";

const UserFormContainer = (props) => {
  const { userFormDrawerStatus, toggleUserFormDrawer } = props;
  const businessId = useBusinessId();
  const history = useHistory();

  const [screen, setscreen] = useState("mobile");
  const [formError, setFormError] = useState("");
  const [signupInfoResult, setSignupInfoResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const closeAuthDrawer = () => {
    consumePostAuthRedirect();
    setscreen("mobile");
    setFormError("");
    setSignupInfoResult(null);
    toggleUserFormDrawer(false);
  };

  const [signupInfo] = useSignupInfoMutation();
  const [sendOtp] = useSendOtpMutation();
  const [login] = useStorefrontLoginMutation();
  const [register] = useStorefrontRegisterMutation();

  const validateSchema = Yup.object().shape({
    customerName: Yup.string().required("Name required *"),
    whatsAppNumber: Yup.string()
      .matches(/^\d{10}$/, "WhatsApp number must be exactly 10 digits")
      .required("WhatsApp number is required *"),
  });
  const validateDigits = (values) => {
    const digitRegex = /^\d+$/;
    const errors = {};

    if (!digitRegex.test(values.whatsAppNumber) || values.whatsAppNumber.length > 10) {
      errors.whatsAppNumber = "WhatsApp number must be a maximum of 10 digits.";
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
    validate: validateDigits,
    onSubmit: async (values) => {
      setFormError("");
      setBusy(true);
      try {
        const result = await signupInfo({
          identifier: values.whatsAppNumber,
          countryCode: "+91",
          businessId,
        }).unwrap();
        setSignupInfoResult(result);
        if (!result?.otpSent) {
          const sent = await sendOtp({
            identifier: values.whatsAppNumber,
            countryCode: "+91",
            businessId,
          }).unwrap();
          if (!sent?.otpSent) {
            setFormError(result?.message || "Could not send OTP. Please try again.");
            return;
          }
        }
        setscreen("otp");
      } catch (err) {
        setFormError(rtkErrorMessage(err, "Could not send OTP. Please try again."));
      } finally {
        setBusy(false);
      }
    },
  });

  const handleDigitsChange = (event, lengthOfChar) => {
    const inputValue = event.target.value;
    if (inputValue.length <= lengthOfChar) {
      formik.handleChange(event);
    }
  };

  const finishAuth = (result) => {
    persistStorefrontAuth(result, formik.values);
    setscreen("mobile");
    setSignupInfoResult(null);
    const redirect = consumePostAuthRedirect();
    toggleUserFormDrawer(false);
    if (redirect) history.push(redirect);
  };

  const submitOtp = async (otp) => {
    setFormError("");
    setBusy(true);
    const identifier = formik.values.whatsAppNumber;
    const fullName = formik.values.customerName;
    const isNew =
      signupInfoResult?.isNewCustomer ||
      signupInfoResult?.hasProfileForStore === false;
    try {
      if (isNew) {
        const result = await register({
          identifier,
          countryCode: "+91",
          businessId,
          fullName,
          otp,
        }).unwrap();
        finishAuth(result);
        return;
      }
      try {
        const result = await login({
          identifier,
          countryCode: "+91",
          businessId,
          otp,
        }).unwrap();
        finishAuth(result);
      } catch (err) {
        if (isRegistrationRequired(err)) {
          const result = await register({
            identifier,
            countryCode: "+91",
            businessId,
            fullName,
            otp,
          }).unwrap();
          finishAuth(result);
          return;
        }
        throw err;
      }
    } catch (err) {
      setFormError(rtkErrorMessage(err, "Invalid or expired OTP"));
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setFormError("");
    try {
      const sent = await sendOtp({
        identifier: formik.values.whatsAppNumber,
        countryCode: "+91",
        businessId,
      }).unwrap();
      if (!sent?.otpSent) {
        setFormError("Please wait before requesting another code.");
      }
    } catch (err) {
      setFormError(rtkErrorMessage(err, "Could not resend OTP"));
    }
  };

  return (
    <>
      <DrawerComp
        placement={"bottom"}
        bg="black"
        height="55vh"
        borderTopRightRadius="30px"
        borderTopLeftRadius="30px"
        onClose={closeAuthDrawer}
        toggleDrawer={userFormDrawerStatus}
      >
        <DrawerHeader
          backgroundImage="url('https://cdn.dotpe.in/cfe/image/img-promo-banner-bg.png')"
          backgroundRepeat="no-repeat"
          backgroundSize="cover"
          borderTopRightRadius="30px"
          borderTopLeftRadius="30px"
          py="5px"
          px="8px"
          borderBottomWidth="1px"
        >
          {screen == "otp" ? (
            <DrawerHeaderCustom
              type="otp"
              method={setscreen}
              someArgs={"mobile"}
              text="Enter OTP"
            />
          ) : (
            <DrawerHeaderCustom
              type="phone"
              method={closeAuthDrawer}
              text="Confirm your WhatsApp number"
            />
          )}
        </DrawerHeader>
        <DrawerBody>
          {formError ? (
            <Text color="red.500" fontSize="sm" mb={2}>
              {formError}
            </Text>
          ) : null}
          {screen == "otp" ? (
            <OtpFields
              setscreen={setscreen}
              someArgs={"phone"}
              submitOtp={submitOtp}
              resendOtp={resendOtp}
              busy={busy}
            />
          ) : (
            <ContactFields
              setscreen={setscreen}
              formik={formik}
              handleDigitsChange={handleDigitsChange}
              busy={busy}
            />
          )}
        </DrawerBody>
      </DrawerComp>
    </>
  );
};

export default UserFormContainer;
