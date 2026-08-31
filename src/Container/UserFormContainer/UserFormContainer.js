import React, { useRef } from "react";
import { DrawerBody, DrawerHeader, Text } from "@chakra-ui/react";
import DrawerComp from "../../Components/DrawerComp/DrawerComp";
import DrawerHeaderCustom from "../../Components/DrawerComp/DrawerHeaderCustom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ContactFields from "./ContactFields";
import OtpFields from "./OtpFields";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { CHROME_BAR_BG } from "@/lib/menu/storeChrome";
import { normalizeIndianMobile } from "@/src/utils/phone";
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
  const nameRef = useRef(null);
  const phoneRef = useRef(null);

  const [screen, setscreen] = React.useState("mobile");
  const [formError, setFormError] = React.useState("");
  const [signupInfoResult, setSignupInfoResult] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

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
    customerName: Yup.string().trim().required("Name required *"),
    whatsAppNumber: Yup.string()
      .matches(/^\d{10}$/, "WhatsApp number must be exactly 10 digits")
      .required("WhatsApp number is required *"),
  });

  const formik = useFormik({
    initialValues: {
      customerName: "",
      whatsAppNumber: "",
    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const customerName = (
        values.customerName ||
        nameRef.current?.value ||
        ""
      ).trim();
      const whatsAppNumber = normalizeIndianMobile(
        values.whatsAppNumber || phoneRef.current?.value,
      );
      if (customerName !== values.customerName || whatsAppNumber !== values.whatsAppNumber) {
        formik.setValues({ customerName, whatsAppNumber }, true);
      }
      if (!customerName || whatsAppNumber.length !== 10) {
        formik.setTouched({ customerName: true, whatsAppNumber: true }, true);
        return;
      }
      setFormError("");
      setBusy(true);
      try {
        const result = await signupInfo({
          identifier: whatsAppNumber,
          countryCode: "+91",
          businessId,
          fullName: customerName,
        }).unwrap();
        setSignupInfoResult(result);
        if (!result?.otpSent) {
          const sent = await sendOtp({
            identifier: whatsAppNumber,
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
    const identifier = normalizeIndianMobile(formik.values.whatsAppNumber);
    const fullName = formik.values.customerName.trim();
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
          fullName,
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
        identifier: normalizeIndianMobile(formik.values.whatsAppNumber),
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
        bg="white"
        height="55vh"
        borderTopRightRadius="30px"
        borderTopLeftRadius="30px"
        onClose={closeAuthDrawer}
        toggleDrawer={userFormDrawerStatus}
      >
        <DrawerHeader
          bg={CHROME_BAR_BG}
          color="white"
          borderTopRightRadius="30px"
          borderTopLeftRadius="30px"
          py="5px"
          px="8px"
          borderBottomWidth="0"
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
        <DrawerBody bg="white" color="#111111">
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
              nameRef={nameRef}
              phoneRef={phoneRef}
              busy={busy}
            />
          )}
        </DrawerBody>
      </DrawerComp>
    </>
  );
};

export default UserFormContainer;
