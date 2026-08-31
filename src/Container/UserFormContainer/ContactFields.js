import React from "react";
import {
  InputLeftElement,
  Icon,
  Button,
  InputGroup,
  Input,
  Stack,
  VStack,
  FormControl,
} from "@chakra-ui/react";
import { RiWhatsappFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import InputErrorMessage from "../../Components/InputErrorMessage/InputErrorMessage";
import { normalizeIndianMobile, splitContactAutofill } from "../../utils/phone";

const fieldStyle = {
  h: 45,
  color: "#111111",
  bg: "white",
  borderColor: "#E5E7EB",
  _placeholder: { color: "gray.500" },
  _focus: { borderColor: "#111111", boxShadow: "none" },
};

const ContactFields = (props) => {
  const { formik, nameRef, phoneRef, busy } = props;

  const applyPhone = (raw) => {
    formik.setFieldValue("whatsAppNumber", normalizeIndianMobile(raw), true);
  };

  const applyName = (raw) => {
    const { name, phone } = splitContactAutofill(raw);
    const nextName = name || (phone ? "" : String(raw || ""));
    formik.setFieldValue("customerName", nextName.slice(0, 40), true);
    if (phone) applyPhone(phone);
  };

  const onAutofill = (event, apply) => {
    if (event.animationName !== "onAutoFillStart") return;
    apply(event.target.value);
  };

  return (
    <>
      <Stack spacing={8}>
        <form onSubmit={formik.handleSubmit} autoComplete="on">
          <VStack spacing={4} align="flex-start">
            <FormControl>
              <InputGroup mt={5}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaUser} mt={2} color="gray.500" />
                </InputLeftElement>
                <Input
                  {...fieldStyle}
                  ref={nameRef}
                  isInvalid={formik.touched.customerName && formik.errors.customerName}
                  name="customerName"
                  autoComplete="name"
                  autoCapitalize="words"
                  placeholder="Customer Name"
                  onChange={(e) => applyName(e.target.value)}
                  onInput={(e) => applyName(e.target.value)}
                  onAnimationStart={(e) => onAutofill(e, applyName)}
                  onBlur={formik.handleBlur}
                  value={formik.values.customerName}
                />
              </InputGroup>
              {formik.errors.customerName && formik.touched.customerName && (
                <InputErrorMessage errorMessage={formik.errors.customerName} />
              )}
            </FormControl>

            <FormControl>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon color="whatsapp.500" mt={2} boxSize={5} as={RiWhatsappFill} />
                </InputLeftElement>
                <Input
                  {...fieldStyle}
                  ref={phoneRef}
                  isInvalid={formik.touched.whatsAppNumber && formik.errors.whatsAppNumber}
                  name="whatsAppNumber"
                  autoComplete="tel"
                  inputMode="numeric"
                  type="tel"
                  placeholder="WhatsApp number"
                  onChange={(e) => applyPhone(e.target.value)}
                  onInput={(e) => applyPhone(e.target.value)}
                  onAnimationStart={(e) => onAutofill(e, applyPhone)}
                  onPaste={(e) => {
                    const text = e.clipboardData?.getData("text");
                    if (!text) return;
                    e.preventDefault();
                    applyPhone(text);
                  }}
                  onBlur={(e) => {
                    applyPhone(e.target.value);
                    formik.handleBlur(e);
                  }}
                  value={formik.values.whatsAppNumber}
                />
              </InputGroup>
              {formik.errors.whatsAppNumber && formik.touched.whatsAppNumber && (
                <InputErrorMessage errorMessage={formik.errors.whatsAppNumber} />
              )}
            </FormControl>

            <Button
              type="submit"
              isLoading={busy}
              variant="solidFull"
              alignSelf="center"
              size="lg"
            >
              CONTINUE
            </Button>
          </VStack>
        </form>
      </Stack>
    </>
  );
};

export default ContactFields;
