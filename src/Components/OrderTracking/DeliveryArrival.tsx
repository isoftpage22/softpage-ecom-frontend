"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import type { OrderTracking } from "@/types/order.types";

const DONE = /delivered|cancel|failed|returned|rto/i;

function arrivalTime(iso?: string | null): string | null {
  if (!iso) return null;
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return null;
  return at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** "Arriving in 15–25 min · by 7:40 pm" and the code to give the rider. */
export default function DeliveryArrival({
  tracking,
  closed,
}: {
  tracking?: OrderTracking | null;
  closed?: boolean;
}) {
  if (!tracking || closed || DONE.test(String(tracking.status || ""))) return null;
  const by = arrivalTime(tracking.arrivalBy);
  const label = tracking.arrivalLabel;
  if (!label && !by && !tracking.deliveryOtp) return null;
  return (
    <Flex direction="column" gap={2} mb={3}>
      {label || by ? (
        <Text fontSize="sm" fontWeight="700" color="gray.800" textTransform="none">
          {label ? `Arriving in ${label}` : "Arriving"}
          {by ? (
            <Text as="span" fontWeight="400" color="gray.500">
              {" "}· by {by}
            </Text>
          ) : null}
        </Text>
      ) : null}
      {tracking.deliveryOtp ? (
        <Box bg="gray.50" borderRadius="md" px={3} py={2}>
          <Text fontSize="sm" color="gray.700" textTransform="none">
            Delivery code{" "}
            <Text as="span" fontFamily="mono" fontSize="md" fontWeight="700" letterSpacing="0.2em">
              {tracking.deliveryOtp}
            </Text>
          </Text>
          <Text fontSize="xs" color="gray.500" textTransform="none">
            Share it with the rider at your door
          </Text>
        </Box>
      ) : null}
    </Flex>
  );
}
