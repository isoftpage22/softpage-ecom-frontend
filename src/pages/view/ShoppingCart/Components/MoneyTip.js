import React from 'react'
import Tip from '../Assets/Images/Tip.svg'

import { Box, Collapse,useDisclosure, Input, InputGroup,Flex,Text,Spacer, InputLeftElement,Image } from '@chakra-ui/react'
const MoneyTip = () => {
  const [tipAmount, setTipAmount] = React.useState(0)
  return (
     <Box bg ="white" mb="5px">
    <Box  alignItems="center" d="flex" justifyContent="center" flexDirection="column" h="103px" bg="rgba(199, 185, 255, 0.1)">
          <Flex alignItems="center" >
            <Text variant="solidCartTip" textAlign="center">Would you like to add a tip?</Text> <Spacer/>  <Image src={Tip} ml="5px" alignSelf="center"  alt="" />
            </Flex>
          <InputGroup w="294px">
            <InputLeftElement pointerEvents="none">₹</InputLeftElement>
            <Input onChange={(e) => setTipAmount(e.target.value)} type="number" variant="flushed" placeholder="Enter amount" />
          </InputGroup>
        </Box>
        </Box>
  )
}

export default MoneyTip
