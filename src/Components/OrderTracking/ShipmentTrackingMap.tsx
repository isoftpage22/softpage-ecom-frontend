'use client';

import dynamic from 'next/dynamic';
import { Box, IconButton, Text } from '@chakra-ui/react';
import { MdMyLocation } from 'react-icons/md';
import type { TrackPoint } from './ShipmentTrackingMapInner';
import { DeliveryPartnerBadge } from './DeliveryPartnerBadge';

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
  provider?: string | null;
  providerLabel?: string | null;
  booked?: boolean;
  onRefreshLive?: () => void;
  refreshingLive?: boolean;
  canRefreshLive?: boolean;
}) {
  const badge = (
    <DeliveryPartnerBadge
      provider={props.provider}
      providerLabel={props.providerLabel}
      booked={props.booked}
    />
  );
  const liveBtn = props.canRefreshLive && props.onRefreshLive ? (
    <IconButton
      aria-label="Get live location"
      title="Get live location"
      icon={<MdMyLocation />}
      size="sm"
      isLoading={props.refreshingLive}
      onClick={props.onRefreshLive}
      bg="white"
      boxShadow="md"
    />
  ) : null;

  if (!props.current && !props.pickup && !props.drop) {
    return (
      <Box
        position="relative"
        minH="88px"
        px={4}
        py={3}
        bg="gray.50"
        borderRadius="lg"
        border="1px solid #e2e8f0"
      >
        {liveBtn ? (
          <Box position="absolute" top="8px" left="8px" zIndex={2}>
            {liveBtn}
          </Box>
        ) : null}
        {badge ? (
          <Box position="absolute" top="8px" right="8px" zIndex={2}>
            {badge}
          </Box>
        ) : null}
        <Text fontSize="sm" color="gray.600" pr={badge ? '108px' : undefined} pl={liveBtn ? '44px' : undefined}>
          {props.fallbackMessage || 'Looking for a rider…'}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      h="240px"
      overflow="hidden"
      borderRadius="lg"
      border="1px solid #e2e8f0"
    >
      {liveBtn ? (
        <Box position="absolute" top="10px" left="10px" zIndex={500}>
          {liveBtn}
        </Box>
      ) : null}
      {badge ? (
        <Box position="absolute" top="10px" right="10px" zIndex={500}>
          {badge}
        </Box>
      ) : null}
      <Inner
        current={props.current}
        pickup={props.pickup}
        drop={props.drop}
        live={props.live}
      />
    </Box>
  );
}
