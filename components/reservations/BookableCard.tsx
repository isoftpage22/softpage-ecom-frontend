"use client";

import type { ReactNode } from "react";
import { Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { HiOutlineClock, HiOutlineLocationMarker, HiArrowRight } from "react-icons/hi";
import { Link } from "@/src/lib/nav";
import type { BookableBrowseItem } from "@/store/api/reservationsApi";
import { BOOKING_PRIMARY } from "./bookingChrome";

const STRATEGY_META: Record<string, { cta: string; kicker: string }> = {
  TIME_SLOT: { cta: "Book now", kicker: "Appointment" },
  TABLE: { cta: "Reserve a table", kicker: "Table booking" },
  DATE_RANGE: { cta: "Check availability", kicker: "Stay" },
  CAPACITY_POOL: { cta: "Register", kicker: "Event" },
  SEATED_INVENTORY: { cta: "Buy tickets", kicker: "Tickets" },
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const monthDay = (iso: string) => {
  const d = new Date(iso);
  return {
    month: d.toLocaleString("en-IN", { month: "short" }).toUpperCase(),
    day: d.toLocaleString("en-IN", { day: "numeric" }),
  };
};

function currency(amount: number, code = "INR") {
  return code === "INR" ? `₹${amount.toFixed(0)}` : `${code} ${amount.toFixed(2)}`;
}

function MetaPill({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Flex
      align="center"
      gap="6px"
      px="10px"
      h="28px"
      borderRadius="full"
      bg="gray.50"
      color="gray.600"
      fontSize="12px"
      fontWeight="600"
    >
      {icon}
      {children}
    </Flex>
  );
}

export function BookableCard({ item }: { item: BookableBrowseItem }) {
  const meta = STRATEGY_META[item.allocationStrategy] || STRATEGY_META.TIME_SLOT;
  const occ = item.nextOccurrence;
  const badge = occ ? monthDay(occ.startTime) : null;

  const priceLabel = (() => {
    if (item.allocationStrategy === "DATE_RANGE") {
      const rate = item.startingRate ?? (item.priceAmount || 0);
      return rate > 0 ? `${currency(rate, item.currency)}/night` : null;
    }
    return item.priceAmount > 0 ? currency(item.priceAmount, item.currency) : null;
  })();

  const durationLabel =
    item.durationMinutes &&
    (item.allocationStrategy === "TABLE" || item.allocationStrategy === "TIME_SLOT")
      ? `${item.durationMinutes} min`
      : null;

  const eventDetail = (() => {
    switch (item.allocationStrategy) {
      case "CAPACITY_POOL":
        return occ
          ? `${fmtDateTime(occ.startTime)}${occ.deliveryType === "VIRTUAL" ? " · Online" : ""}`
          : "No upcoming sessions";
      case "SEATED_INVENTORY":
        return occ ? fmtDateTime(occ.startTime) : "No upcoming shows";
      case "DATE_RANGE":
        return item.resourceCount > 0
          ? `${item.resourceCount} room${item.resourceCount === 1 ? "" : "s"} available`
          : null;
      default:
        return null;
    }
  })();

  const soldOut =
    (item.allocationStrategy === "CAPACITY_POOL" ||
      item.allocationStrategy === "SEATED_INVENTORY") &&
    !occ;

  const inner = (
    <>
      <Box position="relative" h="200px" overflow="hidden" bg="gray.100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        ) : (
          <Flex w="100%" h="100%" align="center" justify="center" bg="gray.100" color="gray.400" fontSize="40px">
            🍽️
          </Flex>
        )}
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-t, blackAlpha.600 0%, transparent 48%)"
        />
        <Text
          position="absolute"
          left="12px"
          top="12px"
          borderRadius="full"
          bg="blackAlpha.700"
          color="white"
          px="10px"
          py="4px"
          fontSize="10px"
          fontWeight="800"
          letterSpacing="0.08em"
          textTransform="uppercase"
        >
          {meta.kicker}
        </Text>
        {badge ? (
          <Flex
            position="absolute"
            right="12px"
            top="12px"
            h="54px"
            w="54px"
            direction="column"
            align="center"
            justify="center"
            borderRadius="14px"
            bg="white"
            boxShadow="0 8px 20px rgba(0,0,0,0.18)"
          >
            <Text fontSize="9px" fontWeight="800" color="gray.500" letterSpacing="0.06em">
              {badge.month}
            </Text>
            <Text fontSize="20px" fontWeight="800" lineHeight="1" color="gray.900">
              {badge.day}
            </Text>
          </Flex>
        ) : null}
        {durationLabel ? (
          <Flex
            position="absolute"
            left="12px"
            bottom="12px"
            align="center"
            gap="6px"
            px="10px"
            h="28px"
            borderRadius="full"
            bg="whiteAlpha.900"
            color="gray.800"
            fontSize="12px"
            fontWeight="700"
          >
            <HiOutlineClock />
            {durationLabel} sitting
          </Flex>
        ) : null}
      </Box>

      <Flex flex="1" direction="column" p="16px" pb="18px">
        <Text fontSize="17px" fontWeight="800" color="gray.900" letterSpacing="-0.02em" lineHeight="1.3">
          {item.name}
        </Text>
        {item.description ? (
          <Text mt="6px" fontSize="13px" color="gray.500" noOfLines={3} lineHeight="1.5">
            {item.description}
          </Text>
        ) : null}

        {(eventDetail || item.venueInfo) && (
          <Flex mt="10px" wrap="wrap" gap="8px">
            {eventDetail ? <MetaPill>{eventDetail}</MetaPill> : null}
            {item.venueInfo ? (
              <MetaPill icon={<HiOutlineLocationMarker />}>
                {item.venueInfo.name}
              </MetaPill>
            ) : null}
          </Flex>
        )}
        {occ && occ.remaining > 0 && occ.remaining <= 20 ? (
          <Text mt="8px" fontSize="12px" fontWeight="700" color="orange.600">
            {occ.remaining} spot{occ.remaining === 1 ? "" : "s"} left
          </Text>
        ) : null}

        <Box mt="auto" pt="16px">
          <Flex align="baseline" justify="space-between" gap="12px" mb="12px">
            <Text fontSize="11px" fontWeight="700" color="gray.500" letterSpacing="0.04em" textTransform="uppercase">
              {priceLabel ? "From" : "Cover"}
            </Text>
            <Text fontSize="16px" fontWeight="800" color="gray.900">
              {priceLabel ?? "Complimentary"}
            </Text>
          </Flex>
          {soldOut ? (
            <Flex
              align="center"
              justify="center"
              borderRadius="12px"
              bg="gray.100"
              h="44px"
              fontSize="13px"
              fontWeight="700"
              color="gray.400"
            >
              Unavailable
            </Flex>
          ) : (
            <Flex
              align="center"
              justify="center"
              gap="8px"
              borderRadius="12px"
              bg={BOOKING_PRIMARY}
              color="white"
              h="44px"
              fontSize="14px"
              fontWeight="700"
            >
              {meta.cta}
              <HiArrowRight />
            </Flex>
          )}
        </Box>
      </Flex>
    </>
  );

  const cardProps = {
    display: "flex",
    flexDir: "column" as const,
    overflow: "hidden" as const,
    borderRadius: "20px",
    bg: "white",
    border: "1px solid",
    borderColor: "blackAlpha.50",
    boxShadow: "0 8px 28px rgba(15,23,42,0.06)",
    h: "100%",
  };

  if (soldOut) {
    return <Box {...cardProps}>{inner}</Box>;
  }

  return (
    <Box
      as={Link}
      href={`/book/${item.id}`}
      {...cardProps}
      textDecoration="none"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 14px 36px rgba(15,23,42,0.12)",
        textDecoration: "none",
      }}
      _active={{ transform: "scale(0.99)" }}
      transition="transform 0.15s ease, box-shadow 0.15s ease"
    >
      {inner}
    </Box>
  );
}

export function BookableCardSkeleton() {
  return (
    <Box
      overflow="hidden"
      borderRadius="20px"
      border="1px solid"
      borderColor="blackAlpha.50"
      bg="white"
    >
      <Skeleton h="200px" />
      <Box p="16px">
        <Skeleton h="18px" w="70%" mb="10px" borderRadius="6px" />
        <Skeleton h="12px" w="100%" mb="8px" borderRadius="6px" />
        <Skeleton h="12px" w="80%" mb="18px" borderRadius="6px" />
        <Flex justify="space-between" mb="12px">
          <Skeleton h="12px" w="48px" borderRadius="6px" />
          <Skeleton h="16px" w="110px" borderRadius="6px" />
        </Flex>
        <Skeleton h="44px" w="100%" borderRadius="12px" />
      </Box>
    </Box>
  );
}
