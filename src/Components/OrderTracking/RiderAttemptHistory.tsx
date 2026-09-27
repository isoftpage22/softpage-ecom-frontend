"use client";

import { Box, Link, Text } from "@chakra-ui/react";
import { deliveryStatusLabel, isClosedShipment } from "@/lib/orders/statusLabels";
import type { OrderTrackingAttempt } from "@/types/order.types";

function formatWhen(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RiderAttemptHistory({
  attempts,
}: {
  attempts?: OrderTrackingAttempt[] | null;
}) {
  const latest = attempts?.length ? attempts[attempts.length - 1] : null;
  if (!latest) return null;
  if ((attempts?.length || 0) === 1 && !isClosedShipment(latest.status)) return null;

  const closed = isClosedShipment(latest.status);
  const when = [
    formatWhen(latest.createdAt),
    latest.cancelledAt ? `Cancelled ${formatWhen(latest.cancelledAt)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const partner = latest.providerLabel || latest.provider;

  return (
    <Box mt={3} pt={3} borderTop="1px solid" borderColor="gray.200">
      <Text fontWeight="700" fontSize="sm" mb={2}>
        Latest rider
      </Text>
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={3}>
        <Text fontSize="sm" fontWeight="700">
          {partner ? `${partner} · ` : ""}
          {deliveryStatusLabel(latest.status)}
        </Text>
        {when ? (
          <Text fontSize="xs" color="gray.500" mt={1}>
            {when}
          </Text>
        ) : null}
        {latest.driverName ? <Text fontSize="sm">Rider: {latest.driverName}</Text> : null}
        {latest.driverPhone ? (
          <Text fontSize="sm">
            Phone:{" "}
            <Text as="a" href={`tel:${String(latest.driverPhone).replace(/[^\d+]/g, "")}`}>
              {latest.driverPhone}
            </Text>
          </Text>
        ) : null}
        {latest.vehicleNumber ? <Text fontSize="sm">Vehicle: {latest.vehicleNumber}</Text> : null}
        {latest.trackingId ? (
          <Text fontSize="xs" color="gray.500">
            AWB {latest.trackingId}
          </Text>
        ) : null}
        {latest.reason ? (
          <Text fontSize="sm" color="orange.700" mt={1}>
            {latest.reason}
          </Text>
        ) : null}
        {latest.trackingUrl ? (
          <Link
            href={latest.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            fontSize="sm"
            fontWeight="600"
            color={closed ? "gray.500" : "blue.600"}
          >
            {closed ? "Cancelled tracking" : "Tracking details"}
          </Link>
        ) : null}
      </Box>
    </Box>
  );
}
