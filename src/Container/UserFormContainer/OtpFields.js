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
            <PinInputField autoComplete="one-time-code" h={46} w={42} />
            <PinInputField h={46} w={42} />
            <PinInputField h={46} w={42} />
            <PinInputField h={46} w={42} />
            <PinInputField h={46} w={42} />
            <PinInputField h={46} w={42} />
          </PinInput>
        </HStack>
        <Flex justifyContent={"center"} alignItems="center" flexDir="column">
          <Flex justifyContent={"center"}>
            {time > 0 ? (
              <>
                <Text opacity={0.4} textAlign={"center"}>
                  I didn't receive code.
                </Text>{" "}
                <Text ml="2" color={"#8D33FF"} opacity={0.4}>
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
                  color={"#8D33FF"}
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
          opacity={canSubmit ? 1 : 0.4}
          variant="solidFull"
          bg="#f4c359"
          alignSelf="center"
          size="lg"
        >
          SUBMIT
        </Button>
      </VStack>
    </>
  );
};

export default OtpFields;
