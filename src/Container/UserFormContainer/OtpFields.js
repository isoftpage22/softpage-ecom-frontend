import React, { useEffect } from "react";
import { HStack, PinInput, PinInputField, Button, VStack, Flex, Text } from "@chakra-ui/react";

const OtpFields = (props) => {
  const { submitOtp, resendOtp, busy } = props;
  const [time, setTime] = React.useState(30);
  const [otp, setOtp] = React.useState("");

  useEffect(() => {
    let interval = setInterval(() => {
      setTime((prevState) => prevState - 1);
    }, 1000);
    if (time == 0 || time < 0) {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [time]);

  useEffect(() => {
    if (typeof window === "undefined" || !("OTPCredential" in window)) return;
    const ac = new AbortController();
    navigator.credentials
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((cred) => {
        const code = cred && cred.code ? String(cred.code).replace(/\D/g, "") : "";
        if (code) setOtp(code.slice(0, 6));
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const canSubmit = otp.length === 6 && !busy;

  return (
    <>
      <VStack spacing={4} align="center">
        <HStack mt={5} spacing={2} justifyContent={"center"}>
          <PinInput otp type="number" onChange={setOtp} value={otp} autoFocus>
            <PinInputField autoComplete="one-time-code" h={46} w={42} color="gray.800" bg="white" />
            <PinInputField h={46} w={42} color="gray.800" bg="white" />
            <PinInputField h={46} w={42} color="gray.800" bg="white" />
            <PinInputField h={46} w={42} color="gray.800" bg="white" />
            <PinInputField h={46} w={42} color="gray.800" bg="white" />
            <PinInputField h={46} w={42} color="gray.800" bg="white" />
          </PinInput>
        </HStack>
        <Flex justifyContent={"center"} alignItems="center" flexDir="column">
          <Flex justifyContent={"center"}>
            {time > 0 ? (
              <>
                <Text opacity={0.4} textAlign={"center"}>
                  I didn't receive code.
                </Text>{" "}
                <Text ml="2" color="gray.400">
                  Resend Code
                </Text>
              </>
            ) : (
              <>
                <Text textAlign={"center"}>I didn't receive code.</Text>{" "}
                <Text
                  onClick={() => {
                    setTime(30);
                    if (resendOtp) resendOtp();
                  }}
                  ml="2"
                  color="#111111"
                  fontWeight="700"
                >
                  Resend Code
                </Text>
              </>
            )}
          </Flex>
          {time > 0 ? (
            <Text textAlign={"center"} mt="1">
              {time}Sec Left
            </Text>
          ) : (
            ""
          )}
        </Flex>
        <Button
          onClick={() => canSubmit && submitOtp(otp)}
          isLoading={busy}
          loadingText="SUBMIT"
          spinnerPlacement="start"
          opacity={busy || canSubmit ? 1 : 0.4}
          variant="solidFull"
          alignSelf="center"
          size="lg"
          bg="black"
          color="white"
          _hover={{ bg: "black", _disabled: { bg: "black", color: "white" } }}
          _disabled={{ bg: "black", color: "white", opacity: 0.85 }}
          _loading={{ bg: "black", color: "white", opacity: 1 }}
        >
          SUBMIT
        </Button>
      </VStack>
    </>
  );
};

export default OtpFields;
