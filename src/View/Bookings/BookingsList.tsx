"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { useRequireStorefrontAuth } from "@/lib/auth/useRequireStorefrontAuth";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useHistory } from "@/src/lib/nav";
import {
  useCancelReservationMutation,
  useGetBookablesQuery,
  useGetMyEntitlementsQuery,
  useGetMyReservationsQuery,
  useGetMyTicketsQuery,
  type Reservation,
} from "@/store/api/reservationsApi";
import { CHROME_BAR_BG, CHROME_SURFACE } from "@/lib/menu/storeChrome";
import { PrimaryButton, SignInGate } from "@/components/reservations/bookingChrome";

const actionBtn = {
  size: "sm" as const,
  h: "36px",
  minH: "36px",
  w: "auto",
  minW: "auto",
  px: "14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "none" as const,
  flexShrink: 0,
  overflow: "visible",
  whiteSpace: "nowrap",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  HELD: { bg: "#fef3c7", color: "#92400e", label: "Held" },
  PENDING: { bg: "#ffedd5", color: "#9a3412", label: "Pending" },
  CONFIRMED: { bg: "#dcfce7", color: "#166534", label: "Confirmed" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
  COMPLETED: { bg: "#dbeafe", color: "#1e40af", label: "Completed" },
  NO_SHOW: { bg: "#f4f4f5", color: "#3f3f46", label: "No show" },
};

function dateParts(iso: string) {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleString("en-IN", { weekday: "short" }).toUpperCase(),
    day: d.toLocaleString("en-IN", { day: "numeric" }),
    month: d.toLocaleString("en-IN", { month: "short" }).toUpperCase(),
    time: d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

function chip(status: string) {
  return STATUS_STYLE[status] || { bg: "#f4f4f5", color: "#3f3f46", label: status };
}

export default function BookingsList() {
  const history = useHistory();
  const businessId = useBusinessId();
  const { loggedIn, promptLogin } = useRequireStorefrontAuth("/bookings", { autoOpen: false });
  const { data: reservations, isFetching, error } = useGetMyReservationsQuery(undefined, {
    skip: !loggedIn,
  });
  const { data: bookables } = useGetBookablesQuery({ businessId }, { skip: !businessId });
  const { data: tickets } = useGetMyTicketsQuery(undefined, { skip: !loggedIn });
  const { data: entitlements } = useGetMyEntitlementsQuery(undefined, { skip: !loggedIn });
  const [cancelReservation, { isLoading: cancelling }] = useCancelReservationMutation();

  const names = new Map((bookables || []).map((b) => [b.id, b.name]));

  if (!loggedIn) {
    return (
      <>
        <TopBarWithBackButton headerText="Bookings" />
        <Box bg={CHROME_SURFACE} minH="calc(100vh - 56px)">
          <SignInGate
            title="Sign in to view bookings"
            message="Your table reservations and tickets are saved to this account."
            onSignIn={promptLogin}
          />
        </Box>
      </>
    );
  }

  return (
    <>
      <TopBarWithBackButton headerText="Bookings" />
      <Box p={4} bg="gray.50" minH="calc(100vh - 56px)" pb={10}>
        <Box maxW="2xl" mx="auto">
        <Flex align="center" justify="space-between" mb={4} gap={3}>
          <Text fontSize="12px" fontWeight="700" letterSpacing="0.06em" color="gray.500">
            YOUR RESERVATIONS
          </Text>
          <Button
            {...actionBtn}
            variant="ghost"
            bg={CHROME_BAR_BG}
            color="white"
            _hover={{ bg: CHROME_BAR_BG, opacity: 0.9 }}
            onClick={() => history.push("/book")}
          >
            New booking
          </Button>
        </Flex>

        {isFetching ? (
          <Text color="gray.600">Loading…</Text>
        ) : error ? (
          <Text color="red.600">Could not load bookings.</Text>
        ) : (reservations || []).length === 0 ? (
          <Box bg="white" borderRadius="20px" p={6} textAlign="center" border="1px solid" borderColor="blackAlpha.50">
            <Text fontSize="32px" mb={2}>📅</Text>
            <Text fontWeight="800" fontSize="17px">No bookings yet</Text>
            <Text mt={1} fontSize="14px" color="gray.500">
              Reserve a table and it will show up here.
            </Text>
            <PrimaryButton mt={5} onClick={() => history.push("/book")}>
              Book now
            </PrimaryButton>
          </Box>
        ) : (
          (reservations || []).map((r: Reservation) => {
            const style = chip(r.status);
            const cancellable =
              r.status === "HELD" || r.status === "PENDING" || r.status === "CONFIRMED";
            const upcoming = new Date(r.startTime) > new Date();
            const title = names.get(r.bookableId) || "Reservation";
            const parts = dateParts(r.startTime);
            return (
              <Flex
                key={r.id}
                bg="white"
                borderRadius="18px"
                mb={3}
                overflow="hidden"
                border="1px solid"
                borderColor="blackAlpha.50"
                boxShadow="0 8px 24px rgba(15,23,42,0.05)"
              >
                <Flex
                  w="72px"
                  flexShrink={0}
                  direction="column"
                  align="center"
                  justify="center"
                  bg="gray.50"
                  py={4}
                  borderRight="1px solid"
                  borderColor="blackAlpha.50"
                >
                  <Text fontSize="10px" fontWeight="800" color="gray.500" letterSpacing="0.08em">
                    {parts.weekday}
                  </Text>
                  <Text fontSize="22px" fontWeight="800" lineHeight="1.15" mt="2px" color="gray.900">
                    {parts.day}
                  </Text>
                  <Text fontSize="10px" fontWeight="800" color="gray.500" mt="2px" letterSpacing="0.06em">
                    {parts.month}
                  </Text>
                </Flex>
                <Box flex="1" p={3} minW={0}>
                  <Flex justify="space-between" align="flex-start" gap={3}>
                    <Box minW={0}>
                      <Text fontWeight="800" noOfLines={1} fontSize="15px">
                        {title}
                      </Text>
                      <Text mt="4px" fontSize="13px" color="gray.600">
                        {parts.time}
                        {r.partySize ? ` · ${r.partySize} guests` : ""}
                      </Text>
                      <Text mt="4px" fontSize="11px" color="gray.400" letterSpacing="0.04em">
                        REF {r.id.slice(0, 8).toUpperCase()}
                      </Text>
                    </Box>
                    <Text
                      as="span"
                      fontSize="11px"
                      fontWeight="700"
                      px="8px"
                      py="3px"
                      borderRadius="full"
                      bg={style.bg}
                      color={style.color}
                      flexShrink={0}
                    >
                      {style.label}
                    </Text>
                  </Flex>
                  <Flex mt={3} gap={2} flexWrap="wrap">
                    {r.joinToken && r.status === "CONFIRMED" ? (
                      <Button
                        {...actionBtn}
                        variant="ghost"
                        bg={CHROME_BAR_BG}
                        color="white"
                        _hover={{ bg: CHROME_BAR_BG, opacity: 0.9 }}
                        onClick={() => history.push(`/join/${r.joinToken}`)}
                      >
                        Join
                      </Button>
                    ) : null}
                    {cancellable && upcoming ? (
                      <Button
                        {...actionBtn}
                        variant="ghost"
                        bg="white"
                        color="red.600"
                        border="1px solid"
                        borderColor="red.200"
                        _hover={{ bg: "red.50" }}
                        isDisabled={cancelling}
                        onClick={() => cancelReservation({ id: r.id })}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </Flex>
                </Box>
              </Flex>
            );
          })
        )}

        {(tickets || []).length > 0 ? (
          <Box mt={8}>
            <Text mb={3} fontSize="12px" fontWeight="700" letterSpacing="0.04em" color="gray.500">
              TICKETS
            </Text>
            {(tickets || []).map((t) => (
              <Box
                key={t.id}
                bg="white"
                borderRadius="16px"
                p={4}
                mb={3}
                border="1px solid"
                borderColor="blackAlpha.50"
              >
                <Flex justify="space-between" align="center">
                  <Text fontWeight="700">Seat {t.seatLabel}</Text>
                  <Text fontSize="11px" fontWeight="700" color="gray.500">
                    {t.status.replace("_", " ")}
                  </Text>
                </Flex>
                <Text mt={1} fontFamily="mono" fontSize="12px" color="gray.500">
                  {t.code}
                </Text>
                <Text mt={1} fontSize="11px" color="gray.400">
                  Show this code at the door
                </Text>
              </Box>
            ))}
          </Box>
        ) : null}

        {(entitlements || []).length > 0 ? (
          <Box mt={8}>
            <Text mb={3} fontSize="12px" fontWeight="700" letterSpacing="0.04em" color="gray.500">
              ACCESS
            </Text>
            {(entitlements || []).map((e) => (
              <Box
                key={e.id}
                bg="white"
                borderRadius="16px"
                p={4}
                mb={3}
                border="1px solid"
                borderColor="blackAlpha.50"
              >
                <Flex justify="space-between" align="center">
                  <Text fontWeight="700">
                    {e.subjectType === "COURSE"
                      ? "Course access"
                      : e.subjectType === "EVENT_OCCURRENCE"
                        ? "Event access"
                        : "Access pass"}
                  </Text>
                  <Text fontSize="11px" fontWeight="700" color="gray.500">
                    {e.status}
                  </Text>
                </Flex>
              </Box>
            ))}
          </Box>
        ) : null}
        </Box>
      </Box>
    </>
  );
}
