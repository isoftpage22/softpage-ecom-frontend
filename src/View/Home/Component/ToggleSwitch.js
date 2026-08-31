import { Switch, Box, FormControl, FormLabel, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { MdOutlineEventAvailable } from 'react-icons/md'
import { Link } from '@/src/lib/nav'
import { useStoreCapabilities } from '@/lib/tenant/TenantContext'

const ToggleSwitch = ({ vegOnly, onVegOnlyChange, hideReserve = false }) => {
  const { tableReservation, bookable } = useStoreCapabilities()
  const showReserve = !hideReserve && (tableReservation || bookable)
  const chipLabel = tableReservation ? 'Reserve a table' : 'Book'

  return (
    <Box px="6%" pt="8px" pb="0">
      <Flex justify="space-between" align="center" gap="12px">
        <FormControl display="flex" alignItems="center" w="auto" mb="0">
          <FormLabel
            htmlFor="veg-only"
            mb="0"
            mr="10px"
            color="gray.800"
            fontSize="14px"
            fontWeight="600"
          >
            Veg Only
          </FormLabel>
          <Switch
            id="veg-only"
            colorScheme="green"
            isChecked={!!vegOnly}
            onChange={(event) => onVegOnlyChange?.(event.target.checked)}
          />
        </FormControl>
        {showReserve ? (
          <Box
            as={Link}
            href="/book"
            display="inline-flex"
            alignItems="center"
            gap="6px"
            bg="var(--brand-secondary, #111)"
            color="white"
            fontSize="13px"
            fontWeight="700"
            borderRadius="12px"
            px="12px"
            py="8px"
            lineHeight="1"
            textDecoration="none"
            flexShrink={0}
            whiteSpace="nowrap"
          >
            <MdOutlineEventAvailable size={15} />
            <Text as="span" fontSize="13px" fontWeight="700" color="white">
              {chipLabel}
            </Text>
          </Box>
        ) : null}
      </Flex>
    </Box>
  )
}

export default ToggleSwitch
