'use client';

import { Box } from '@chakra-ui/react';
import {
  deliveryPartnerKind,
  PorterMark,
  ShiprocketMark,
} from './DeliveryPartnerMarks';

export function DeliveryPartnerBadge({
  provider,
  providerLabel,
}: {
  provider?: string | null;
  providerLabel?: string | null;
  booked?: boolean;
}) {
  const kind = deliveryPartnerKind(provider || providerLabel);
  if (!kind) return null;

  const label = kind === 'porter' ? 'Porter' : 'Shiprocket';

  return (
    <Box
      bg="white"
      border="1px solid #e2e8f0"
      borderRadius="10px"
      p="3px"
      boxShadow="0 1px 4px rgba(15, 23, 42, 0.12)"
      lineHeight="0"
      aria-label={label}
      title={label}
    >
      {kind === 'porter' ? <PorterMark width={28} height={28} title={label} /> : null}
      {kind === 'shiprocket' ? <ShiprocketMark width={28} height={28} title={label} /> : null}
    </Box>
  );
}
