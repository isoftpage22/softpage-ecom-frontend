"use client";

import { Switch, Box, FormControl, FormLabel, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { MdOutlineEventAvailable } from 'react-icons/md'
import { Link } from '@/src/lib/nav'
import { useStoreCapabilities } from '@/lib/tenant/TenantContext'

function reservePinStyle(position, liftForBar) {
  if (!position) return {}
  const top = String(position).startsWith('top')
  const center = String(position).endsWith('center')
  const left = String(position).endsWith('left')
  return {
    position: 'fixed',
    zIndex: 1080,
    left: center ? '50%' : left ? '16px' : 'auto',
    right: center || left ? 'auto' : '16px',
    top: top ? '80px' : 'auto',
    bottom: top ? 'auto' : liftForBar ? 'calc(112px + env(safe-area-inset-bottom, 0px))' : '24px',
    transform: center ? 'translateX(-50%)' : undefined,
  }
}

const LOOK_SCALE = { sm: 0.9, md: 1, lg: 1.15, xl: 1.3 }

const ToggleSwitch = ({ vegOnly, onVegOnlyChange, hideReserve = false, reserveLook, liftReserve = false }) => {
  const { tableReservation, bookable } = useStoreCapabilities()
  const previewing = typeof window !== 'undefined' && Boolean(new URLSearchParams(window.location.search).get('sp_preview') || new URLSearchParams(window.location.search).get('sp_edit'))
  const showReserve = !hideReserve && (tableReservation || bookable || previewing)
  const chipLabel = reserveLook?.heading || (tableReservation ? 'Reserve a table' : 'Book')
  const scale = LOOK_SCALE[reserveLook?.fontSize] || 1

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
            data-sp-id="reserve-cta"
            display="inline-flex"
            alignItems="center"
            gap="6px"
            bg={reserveLook?.accent || 'var(--sp-reserve-bg, var(--brand-secondary, #111))'}
            color={reserveLook?.textColor || 'white'}
            fontSize={`${13 * scale}px`}
            fontFamily={reserveLook?.fontFamily || 'var(--sp-reserve-font, inherit)'}
            fontWeight="700"
            borderRadius="12px"
            px="12px"
            py="8px"
            lineHeight="1"
            textDecoration="none"
            flexShrink={0}
            whiteSpace="nowrap"
            {...reservePinStyle(reserveLook?.fabPosition, liftReserve)}
          >
            <MdOutlineEventAvailable size={15} />
            <Text as="span" data-sp-title fontSize={`${13 * scale}px`} fontWeight="700" color="inherit">
              {chipLabel}
            </Text>
          </Box>
        ) : null}
      </Flex>
    </Box>
  )
}

export default ToggleSwitch
