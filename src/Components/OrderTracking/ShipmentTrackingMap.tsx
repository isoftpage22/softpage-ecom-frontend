'use client';

import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
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
}) {
  if (!props.current && !props.pickup && !props.drop) return null;
  return (
    <Box h="240px" overflow="hidden" borderRadius="lg" border="1px solid #e2e8f0">
      <Inner {...props} />
    </Box>
  );
}
