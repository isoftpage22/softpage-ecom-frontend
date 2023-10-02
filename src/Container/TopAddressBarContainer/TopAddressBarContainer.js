import React from 'react'
import {Flex,Text,Icon,Box} from '@chakra-ui/react'
import { HiLocationMarker } from "react-icons/hi";
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom';

const TopAddressBarContainer = () => {
  return (
    <>
     <Box >
      <Link to ="/addresses">
     <Flex  justify={"space-evenly"} bg={"black"} h={30} w={"100%"}>
     <Icon boxSize={5} color={"white"}   as={HiLocationMarker} />
     <Text alignSelf={"flex-start"} fontSize={12} color={"White"}>WORK,</Text>
        <Text alignSelf={"flex-start"} fontSize={14} color={"White"}>B2 2202 Panchsheel greens 2..</Text>
        <ChevronDownIcon boxSize={6} color={"white"} />
     </Flex>
     </Link>
     </Box>
    </>
  )
}

export default TopAddressBarContainer