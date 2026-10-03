import React, { useEffect, useState } from 'react'
import { Flex, Text, Icon, Box } from '@chakra-ui/react'
import { HiLocationMarker } from "react-icons/hi";
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { Link } from '../../lib/nav';

function useAddressLabel(etaLabel) {
  const address = useSelector((state) => state.address.address) || {}
  // Saved address lives in localStorage and is copied into Redux after the
  // layout mounts. Reading it on the first render mismatches the server HTML
  // ("Choose delivery address") once the layout hydrates before this bar.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  const visible = ready ? address : {}
  const hasAddress = Object.keys(visible).length > 0
  const type = visible.checkbox || visible.label || visible.addressType || 'Home'
  const maxLen = etaLabel ? 22 : 28
  const line = visible.address1 || visible.line1 || 'Choose delivery address'
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
    <Box overflow="hidden" maxW="100%">
      <Link to="/addresses">
        <Flex bg="var(--sp-color-surface-chrome, var(--brand-secondary, #111111))" minH="30px" w="100%" maxW="100%" align="center" px={2} gap="6px" overflow="hidden">
          <Icon boxSize={5} color="white" as={HiLocationMarker} flexShrink={0} />
          {hasAddress ? (
            <Text alignSelf="center" fontSize={12} color="white" fontWeight="700" textTransform="uppercase" flexShrink={0}>
              {type},
            </Text>
          ) : null}
          <Text alignSelf="center" fontSize={14} color="white" noOfLines={1} flex="1" minW={0}>
            {short}
          </Text>
          {etaLabel ? (
            <Text alignSelf="center" fontSize="11px" color="white" whiteSpace="nowrap" flexShrink={0}>
              {etaLabel}
            </Text>
          ) : null}
          <ChevronDownIcon boxSize={6} color="white" flexShrink={0} />
        </Flex>
      </Link>
    </Box>
  )
}

export default TopAddressBarContainer
