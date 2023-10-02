import React,{useEffect} from 'react'
import {
  HStack, PinInput, PinInputField, Button, VStack, Flex, Text
} from "@chakra-ui/react"
import { RiWhatsappFill } from "react-icons/ri";
import { PhoneIcon, AddIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons'
import InputErrorMessage from '../../Components/InputErrorMessage/InputErrorMessage';
const OtpFields = (props) => {
  const { formik, handleDigitsChange,sendOtpToMobile,userDetailsAferEnteringMobile,submitOtp } = props
  const [time, setTime] = React.useState(10)
  const [otp, setOtp] = React.useState('')

  useEffect(() => {

    let interval = setInterval(() => {
      setTime(prevState => prevState - 1)
    }, 1000);
    if (time == 0 || time < 0) {
      clearInterval(interval)
    }
    return () => {
      clearInterval(interval)
    }
  }, [time])
  return (
    <>
      <VStack spacing={4} align="center">

        <HStack mt={5} spacing={4} justifyContent={"center"}>
          <PinInput onChange={setOtp} value={otp}>
            <PinInputField h={50} w={50} />
            <PinInputField h={50} w={50} />
            <PinInputField h={50} w={50} />
            <PinInputField h={50} w={50} />
          </PinInput>
        </HStack>
        <Flex justifyContent={"center"} alignItems="center" flexDir="column">
          <Flex justifyContent={"center"}>
            {time > 0 ? <><Text opacity={0.4} textAlign={"center"}>I didn't receive code.</Text> <Text ml="2" color={"#8D33FF"} opacity={0.4} >Resend Code</Text> </>
              :
              <><Text textAlign={"center"}>I didn't receive code.</Text> <Text onClick={() => {setTime(10) }} ml="2" color={"#8D33FF"}>Resend Code</Text></>}
          </Flex>
          {time > 0 ? <Text textAlign={"center"} mt="1">{time}Sec Left</Text> : ''}
        </Flex>
        {
          otp.length == 4?         <Button onClick={submitOtp}  variant="solidFull" bg="#f4c359" alignSelf="center" size="lg" >SUBMIT</Button>
          :
          <Button opacity={0.4} type='submit' variant="solidFull" bg="#f4c359" alignSelf="center" size="lg" >SUBMIT</Button>


        }

      </VStack>
    </>
  )
}

export default OtpFields