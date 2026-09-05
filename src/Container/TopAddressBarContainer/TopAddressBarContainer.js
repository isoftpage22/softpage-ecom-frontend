import React from 'react'
import { Flex, Text, Icon, Box } from '@chakra-ui/react'
import { HiLocationMarker } from "react-icons/hi";
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { Link } from '../../lib/nav';

function useAddressLabel(etaLabel) {
  const address = useSelector((state) => state.address.address) || {}
  const hasAddress = Object.keys(address).length > 0
  const type = address.checkbox || address.label || address.addressType || 'Home'
  const maxLen = etaLabel ? 22 : 28
  const line = address.address1 || address.line1 || 'Choose delivery address'
  const short = String(line).length > maxLen ? `${String(line).slice(0, maxLen)}…` : line
  const title = hasAddress ? `${String(type).toUpperCase()}, ${short}` : short
  return { hasAddress, type, short, title }
}

const TopAddressBarContainer = ({ etaLabel, variant = 'bar' }) => {
  const { hasAddress, type, short, title } = useAddressLabel(etaLabel)

  if (variant === 'inline') {
    return (
      <Link to="/addresses">
        <Flex align="center" minW={0} gap="4px" mt="2px" cursor="pointer">
          <Icon as={HiLocationMarker} boxSize="14px" color="white" flexShrink={0} />
          <Text
            fontSize="12px"
            color="white"
            fontWeight="600"
            noOfLines={1}
            lineHeight="14px"
            textAlign="left"
          >
            {title}
          </Text>
          <ChevronDownIcon boxSize={4} color="white" flexShrink={0} />
        </Flex>
      </Link>
    )
  }

  return (
    <Box>
      <Link to="/addresses">
        <Flex justify="space-evenly" bg="black" h={30} w="100%" align="center" px={2}>
          <Icon boxSize={5} color="white" as={HiLocationMarker} />
          {hasAddress ? (
            <Text alignSelf="center" fontSize={12} color="white" fontWeight="700" textTransform="uppercase">
              {type},
            </Text>
          ) : null}
          <Text alignSelf="center" fontSize={14} color="white" noOfLines={1} flex="1" px={1}>
            {short}
          </Text>
          {etaLabel ? (
            <Text alignSelf="center" fontSize={12} color="white" whiteSpace="nowrap" pr={1}>
             Delivery in {etaLabel}
            </Text>
          ) : null}
          <ChevronDownIcon boxSize={6} color="white" />
        </Flex>
      </Link>
    </Box>
  )
}

export default TopAddressBarContainer
