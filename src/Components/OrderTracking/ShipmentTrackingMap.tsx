'use client';

import dynamic from 'next/dynamic';
import { Box, Text } from '@chakra-ui/react';
import type { TrackPoint } from './ShipmentTrackingMapInner';

const Inner = dynamic(() => import('./ShipmentTrackingMapInner'), {
  ssr: false,
  loading: () => <Box h="100%" minH="240px" bg="gray.100" borderRadius="lg" />,
});

export function ShipmentTrackingMap(props: {
  current?: TrackPoint | null;
  pickup?: TrackPoint | null;
  drop?: TrackPoint | null;
  live?: boolean;
  fallbackMessage?: string;
}) {
  if (!props.current && !props.pickup && !props.drop) {
    return (
      <Box
        minH="88px"
        px={4}
        py={3}
        bg="gray.50"
        borderRadius="lg"
        border="1px solid #e2e8f0"
      >
        <Text fontSize="sm" color="gray.600">
          {props.fallbackMessage || 'Looking for a rider…'}
        </Text>
      </Box>
    );
  }
  return (
    <Box h="240px" overflow="hidden" borderRadius="lg" border="1px solid #e2e8f0">
      <Inner {...props} />
    </Box>
  );
}
