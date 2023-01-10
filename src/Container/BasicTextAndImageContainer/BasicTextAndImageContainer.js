import React from 'react'
import BasicTextAndImageComponent from '../../Components/BasicTextAndImageComponent/BasicTextAndImageComponent'
import { Flex, Icon, Spacer, Text, Box, Image, Button } from '@chakra-ui/react'
import { MdLocalOffer } from "react-icons/md";


const BasicTextAndImageContainer = ({image}) => {
  return (
    <>
    <BasicTextAndImageComponent image={image}>
    <Flex  w="60%" flexDirection="column" >
          <Flex w="55%" justifyContent="space-evenly" py="5px" pl="2px" bg="#fffae6" border="1px" borderColor="#dacdb6">
            <Text variant="muted" >STEALDEAL</Text>
            <Icon color="black" size="sm" as={MdLocalOffer} />
          </Flex>
          <Text variant="muted"> Use this code to get 15% of on your order above Rs.200</Text>
        </Flex>
      <Spacer />
      <Button variant="ghost" alignSelf="center" size="sm" >APPLY</Button>
    </BasicTextAndImageComponent>
    </>
  )
}

export default BasicTextAndImageContainer
