"use client";

import { useMemo, useState } from "react";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useGetBookablesBrowseQuery } from "@/store/api/reservationsApi";
import {
  BookableCard,
  BookableCardSkeleton,
} from "@/components/reservations/BookableCard";
import { ChoiceChip } from "@/components/reservations/bookingChrome";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { Link } from "@/src/lib/nav";
import { ClientOnly } from "@/components/ClientOnly";

const FILTERS: { id: string; label: string; strategies: string[] }[] = [
  { id: "all", label: "All", strategies: [] },
  { id: "events", label: "Events & Tickets", strategies: ["CAPACITY_POOL", "SEATED_INVENTORY"] },
  { id: "appointments", label: "Appointments", strategies: ["TIME_SLOT"] },
  { id: "tables", label: "Tables", strategies: ["TABLE"] },
  { id: "stays", label: "Stays", strategies: ["DATE_RANGE"] },
];

function BookIndexBody() {
  const businessId = useBusinessId();
  const { data: bookables, isLoading } = useGetBookablesBrowseQuery({ businessId });
  const [filter, setFilter] = useState("all");

  const items = bookables || [];

  const availableFilters = useMemo(() => {
    const present = new Set(items.map((b) => b.allocationStrategy));
    return FILTERS.filter(
      (f) => f.id === "all" || f.strategies.some((s) => present.has(s)),
    );
  }, [items]);

  const visible = useMemo(() => {
    const active = FILTERS.find((f) => f.id === filter);
    if (!active || active.strategies.length === 0) return items;
    return items.filter((b) => active.strategies.includes(b.allocationStrategy));
  }, [items, filter]);

  const heading = useMemo(() => {
    const strategies = new Set(items.map((b) => b.allocationStrategy));
    if (isLoading) return "Reserve";
    if (strategies.size === 0) return "Bookings";
    if (strategies.has("SEATED_INVENTORY") || strategies.has("CAPACITY_POOL")) {
      return "Events & Bookings";
    }
    if (strategies.has("DATE_RANGE")) return "Stays & Rooms";
    if (strategies.has("TABLE")) return "Reserve a table";
    return "Book an appointment";
  }, [items, isLoading]);

  const intro = useMemo(() => {
    const strategies = new Set(items.map((b) => b.allocationStrategy));
    if (strategies.size === 1 && strategies.has("TABLE")) {
      return "Pick a seating option and we’ll check live availability for your date.";
    }
    return "Choose an option below to check availability and book.";
  }, [items]);

  return (
    <>
      <TopBarWithBackButton headerText={heading} />
      <Box px="16px" py="20px" pb="56px" bg="gray.50" minH="calc(100vh - 56px)">
        <Box maxW="3xl" mx="auto">
          <Flex align="flex-start" justify="space-between" gap={4} maxW="lg">
            <Text fontSize="14px" color="gray.500" lineHeight="1.55" maxW="280px">
              {intro}
            </Text>
            <Box
              as={Link}
              href="/bookings"
              fontSize="13px"
              fontWeight="700"
              color="gray.800"
              flexShrink={0}
              textDecoration="none"
              _hover={{ textDecoration: "underline" }}
            >
              My bookings
            </Box>
          </Flex>

          {!isLoading && availableFilters.length > 2 ? (
            <Flex mt="16px" wrap="wrap" gap="8px">
              {availableFilters.map((f) => (
                <ChoiceChip
                  key={f.id}
                  selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </ChoiceChip>
              ))}
            </Flex>
          ) : null}

          {isLoading ? (
            <SimpleGrid mt="20px" columns={1} gap="16px" maxW="lg">
              {Array.from({ length: 2 }).map((_, i) => (
                <BookableCardSkeleton key={i} />
              ))}
            </SimpleGrid>
          ) : items.length === 0 ? (
            <Box
              mt="24px"
              bg="white"
              borderRadius="20px"
              p="28px"
              textAlign="center"
              border="1px solid"
              borderColor="blackAlpha.50"
            >
              <Text fontSize="32px" mb="8px">
                📅
              </Text>
              <Text fontWeight="800" fontSize="17px">
                Bookings aren’t available yet
              </Text>
              <Text mt="6px" fontSize="14px" color="gray.500">
                This store doesn’t offer reservations right now.
              </Text>
              <Box
                as={Link}
                href="/"
                mt="18px"
                display="inline-flex"
                h="44px"
                px="18px"
                alignItems="center"
                justifyContent="center"
                borderRadius="12px"
                bg="black"
                color="white"
                fontWeight="700"
                fontSize="14px"
                textDecoration="none"
              >
                Back to menu
              </Box>
            </Box>
          ) : visible.length === 0 ? (
            <Text mt="32px" color="gray.500">
              Nothing available in this category right now.
            </Text>
          ) : (
            <SimpleGrid
              mt="20px"
              columns={{ base: 1, md: visible.length > 1 ? 2 : 1 }}
              gap="16px"
              maxW={visible.length === 1 ? "lg" : undefined}
            >
              {visible.map((b) => (
                <BookableCard key={b.id} item={b} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>
    </>
  );
}

export default function BookIndexPage() {
  return (
    <ClientOnly>
      <BookIndexBody />
    </ClientOnly>
  );
}
