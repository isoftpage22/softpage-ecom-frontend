import { Box, Collapse,useDisclosure, Input, InputGroup,Flex,Text,Spacer, InputLeftElement,Image } from '@chakra-ui/react'
import React from 'react'
import DetailedBill from './DetailedBill'
import { createRipples } from 'react-ripples'
const SpecialInstructions = () => {
  const { isOpen, onToggle } = useDisclosure()
  const MyRipples = createRipples({
    color: 'purple',
    during: 2200,
  })
  return (
   <>
     <Box bg="white" h="31%" w="100%" mb="3px" mt="3px" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
       <Text textAlign="center" pt="20px" pb="10px" onClick={onToggle} variant="mutedCart" >Any special instructions for the chef?</Text>
          <Collapse  in={isOpen} animateOpacity>
            <Input
              mb="4"
              width="100%"
              alignSelf="center"
              placeholder="Write.."
              rounded="md"
              shadow="md"
            />
          </Collapse>
        </Box>
       
   </>
  )
}

export default SpecialInstructions

