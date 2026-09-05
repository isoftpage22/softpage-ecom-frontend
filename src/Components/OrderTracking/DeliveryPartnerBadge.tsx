'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import {
  deliveryPartnerKind,
  PorterMark,
  ShiprocketMark,
} from './DeliveryPartnerMarks';

export function DeliveryPartnerBadge({
  provider,
  providerLabel,
  booked,
}: {
  provider?: string | null;
  providerLabel?: string | null;
  booked?: boolean;
}) {
  const kind = deliveryPartnerKind(provider);
  if (!kind && !providerLabel && !provider) return null;

  const label =
    providerLabel ||
    (kind === 'porter' ? 'Porter' : kind === 'shiprocket' ? 'Shiprocket' : provider || 'Partner');

  return (
    <Flex
      align="center"
      gap="6px"
      bg="white"
      border="1px solid #e2e8f0"
      borderRadius="999px"
      pl="4px"
      pr="10px"
      py="3px"
      boxShadow="0 1px 4px rgba(15, 23, 42, 0.12)"
      maxW="100%"
    >
      {kind === 'porter' ? <PorterMark width={22} height={22} /> : null}
      {kind === 'shiprocket' ? <ShiprocketMark width={22} height={22} /> : null}
      {!kind ? (
        <Box
          w="22px"
          h="22px"
          borderRadius="full"
          bg="gray.800"
          color="white"
          fontSize="10px"
          fontWeight="700"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {(label || '?').slice(0, 1).toUpperCase()}
        </Box>
      ) : null}
      <Box minW={0}>
        <Text fontSize="11px" fontWeight="700" lineHeight="14px" noOfLines={1}>
          {label}
        </Text>
        <Text fontSize="9px" color="gray.500" lineHeight="12px">
          {booked ? 'Delivering' : 'Quoted'}
        </Text>
      </Box>
    </Flex>
  );
}
