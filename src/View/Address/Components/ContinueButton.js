import React ,{Fragment}from 'react'
import { MdAddCircle } from "react-icons/md";
import {
  Icon,Flex,Button
} from "@chakra-ui/react"
const ContinueButton = (props) => {
  const{text="Continue"}=props
  return (
    <>
    <Fragment>
        <Flex justifyContent={"center"}>
          <Flex bg="black" color="black" justifyContent="center" alignItems={"center"} height="42px" position="fixed" width="60%" bottom="20px" borderRadius={12} >
            <Flex px="10px" color="white" justifyContent="center" alignItems="center" w="100%" h="100%" >
              <Button  {...props} variant="solidFull" bg="black" alignSelf="center" >{text}</Button>
            </Flex>
          </Flex>
        </Flex>
      </Fragment>
    
    
    </>
  )
}

export default ContinueButton