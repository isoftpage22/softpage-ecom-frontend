'use client';

import { Box, HStack, Text } from '@chakra-ui/react';

export function DeliveryPartnerBadge({
  provider,
  providerLabel,
  providerLogoUrl,
}: {
  provider?: string | null;
  providerLabel?: string | null;
  providerLogoUrl?: string | null;
  booked?: boolean;
}) {
  const label = providerLabel || provider;
  if (!label && !providerLogoUrl) return null;

  return (
    <Box
      bg="white"
      border="1px solid #e2e8f0"
      borderRadius="10px"
      px="6px"
      py="4px"
      boxShadow="0 1px 4px rgba(15, 23, 42, 0.12)"
      aria-label={label || undefined}
      title={label || undefined}
    >
      <HStack spacing="6px">
        {providerLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={providerLogoUrl} alt="" width={16} height={16} style={{ borderRadius: 4 }} />
        ) : null}
        {label ? <Text fontSize="10px" fontWeight="700" lineHeight="1.2">{label}</Text> : null}
      </HStack>
    </Box>
  );
}
