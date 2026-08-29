import React from 'react'
import { Flex, Text, Icon, Box } from '@chakra-ui/react'
import { HiLocationMarker } from "react-icons/hi";
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { Link } from '../../lib/nav';

const TopAddressBarContainer = ({ etaLabel }) => {
  const address = useSelector((state) => state.address.address) || {}
  const type = address.checkbox || address.label || address.addressType || 'Home'
  const maxLen = etaLabel ? 28 : 36
  const line = address.address1 || address.line1 || 'Choose delivery address'
  const short = String(line).length > maxLen ? `${String(line).slice(0, maxLen)}…` : line

  return (
    <Box>
      <Link to="/addresses">
        <Flex justify="space-evenly" bg="black" h={30} w="100%" align="center" px={2}>
          <Icon boxSize={5} color="white" as={HiLocationMarker} />
          <Text alignSelf="center" fontSize={12} color="white" fontWeight="700" textTransform="uppercase">
            {type},
          </Text>
          <Text alignSelf="center" fontSize={14} color="white" noOfLines={1} flex="1" px={1}>
            {short}
          </Text>
          {etaLabel ? (
            <Text alignSelf="center" fontSize={12} color="white" whiteSpace="nowrap" pr={1}>
              {etaLabel}
            </Text>
          ) : null}
          <ChevronDownIcon boxSize={6} color="white" />
        </Flex>
      </Link>
    </Box>
  )
}

export default TopAddressBarContainer
