"use client";

import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useRequireStorefrontAuth } from "@/lib/auth/useRequireStorefrontAuth";
import { useGetMeQuery } from "@/store/api/storefrontAuthApi";
import {
  useCreateReservationMutation,
  useGetBookablesQuery,
  useGetOccurrencesQuery,
  useGetOccurrenceSeatsQuery,
  type Reservation,
} from "@/store/api/reservationsApi";
import {
  BookingPage,
  BookingSuccess,
  ChoiceChip,
  PrimaryButton,
  SignInGate,
  StepHeading,
  apiErrorMessage,
  BOOKING_PRIMARY,
} from "./bookingChrome";

const MAX_SEATS = 10;

export function SeatedBookingFlow({ bookableId }: { bookableId: string }) {
  const businessId = useBusinessId();
  const { loggedIn, promptLogin } = useRequireStorefrontAuth(`/book/${bookableId}`);

  const [occurrenceId, setOccurrenceId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: bookables } = useGetBookablesQuery({ businessId });
  const bookable = bookables?.find((b) => b.id === bookableId);

  const { data: occurrences, isLoading } = useGetOccurrencesQuery({
    businessId,
    bookableId,
  });
  const { data: seatStatus } = useGetOccurrenceSeatsQuery(
    { businessId, occurrenceId },
    { skip: !occurrenceId },
  );

  const { data: me } = useGetMeQuery(undefined, { skip: !loggedIn });
  const [createReservation, { isLoading: booking }] = useCreateReservationMutation();

  const basePrice = Number(bookable?.priceAmount || 0);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const seatPrice = (sectionPrice?: number | null) =>
    sectionPrice != null ? Number(sectionPrice) : basePrice;

  const total = (seatStatus?.sections || []).reduce(
    (sum, section) =>
      sum +
      section.seats.filter((s) => selectedSeats.includes(s.id)).length *
        seatPrice(section.priceOverride),
    0,
  );

  const toggleSeat = (seatId: string, taken: boolean) => {
    if (taken) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : prev.length >= MAX_SEATS
          ? prev
          : [...prev, seatId],
    );
  };

  const submit = async () => {
    if (!occurrenceId || selectedSeats.length === 0) return;
    setError(null);
    try {
      const reservation = await createReservation({
        businessId,
        bookableId,
        eventOccurrenceId: occurrenceId,
        seatIds: selectedSeats,
        customerName: me?.profile?.displayName || me?.profile?.firstName || undefined,
        customerPhone: me?.identity?.phone || undefined,
        customerEmail: me?.identity?.email || me?.profile?.email || undefined,
      }).unwrap();
      setConfirmed(reservation);
    } catch (e: unknown) {
      setError(
        apiErrorMessage(e, "One of the seats may have just been taken — pick different seats."),
      );
      setSelectedSeats([]);
    }
  };

  if (confirmed) {
    return (
      <BookingSuccess
        title={confirmed.status === "HELD" ? "Seats held for you" : "Tickets booked!"}
        subtitle={`${bookable?.name || ""} · ${fmt(confirmed.startTime)} · ${selectedSeats.length} seat${selectedSeats.length === 1 ? "" : "s"}`}
        extra={
          <Text mt="4px" fontSize="12px" color="gray.400">
            Your tickets are saved to My Bookings.
          </Text>
        }
      />
    );
  }

  if (!loggedIn) {
    return (
      <SignInGate
        title="Sign in to book tickets"
        message="You need an account to book seats."
        onSignIn={promptLogin}
      />
    );
  }

  return (
    <Box maxW="3xl" mx="auto" px="16px" py="24px" pb="48px">
      <Text fontSize="22px" fontWeight="800">
        {bookable?.name || "Book tickets"}
      </Text>
      {bookable?.description ? (
        <Text mt="4px" fontSize="14px" color="gray.500">
          {bookable.description}
        </Text>
      ) : null}

      <Box as="section" mt="32px">
        <StepHeading step={1}>Pick a show</StepHeading>
        {isLoading ? (
          <Box mt="12px" h="64px" borderRadius="12px" bg="gray.100" />
        ) : (occurrences || []).length === 0 ? (
          <Text mt="12px" fontSize="14px" color="gray.500">
            No upcoming shows right now.
          </Text>
        ) : (
          <Flex mt="12px" wrap="wrap" gap="8px">
            {(occurrences || []).map((occ) => {
              const remaining = occ.capacity - occ.bookedCount;
              const soldOut = remaining <= 0;
              return (
                <ChoiceChip
                  key={occ.id}
                  selected={occurrenceId === occ.id}
                  disabled={soldOut}
                  onClick={() => {
                    setOccurrenceId(occ.id);
                    setSelectedSeats([]);
                  }}
                >
                  {fmt(occ.startTime)}
                  {soldOut ? " · Sold out" : ` · ${remaining} left`}
                </ChoiceChip>
              );
            })}
          </Flex>
        )}
      </Box>

      {occurrenceId && seatStatus ? (
        <Box as="section" mt="32px">
          <StepHeading step={2}>Pick your seats</StepHeading>
          <Box
            mt="12px"
            overflowX="auto"
            borderRadius="16px"
            border="1px solid"
            borderColor="gray.200"
            bg="gray.50"
            p="16px"
          >
            <Text textAlign="center" fontSize="12px" letterSpacing="0.16em" color="gray.400" textTransform="uppercase">
              — Stage / Screen —
            </Text>
            {seatStatus.sections.map((section) => (
              <Box key={section.id} mt="16px">
                <Text mb="8px" fontSize="14px" fontWeight="600" color="gray.700">
                  {section.name}
                  {section.priceOverride != null
                    ? ` · ₹${section.priceOverride}`
                    : basePrice > 0
                      ? ` · ₹${basePrice}`
                      : ""}
                </Text>
                <Flex direction="column" gap="4px">
                  {Array.from({ length: section.rows }).map((_, row) => (
                    <Flex key={row} gap="4px">
                      {section.seats
                        .filter((s) => s.rowIndex === row)
                        .map((seat) => {
                          const selected = selectedSeats.includes(seat.id);
                          return (
                            <Box
                              key={seat.id}
                              as="button"
                              type="button"
                              disabled={seat.taken}
                              title={seat.label}
                              onClick={() => toggleSeat(seat.id, seat.taken)}
                              h="28px"
                              w="32px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              borderRadius="6px"
                              fontSize="9px"
                              fontWeight="600"
                              cursor={seat.taken ? "not-allowed" : "pointer"}
                              bg={
                                seat.taken
                                  ? "gray.300"
                                  : selected
                                    ? BOOKING_PRIMARY
                                    : "white"
                              }
                              color={
                                seat.taken ? "gray.400" : selected ? "white" : "gray.600"
                              }
                              border={selected || seat.taken ? "none" : "1px solid"}
                              borderColor="gray.300"
                            >
                              {seat.label}
                            </Box>
                          );
                        })}
                    </Flex>
                  ))}
                </Flex>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      {selectedSeats.length > 0 ? (
        <Box as="section" mt="32px">
          <StepHeading step={3}>Confirm</StepHeading>
          <Flex
            mt="12px"
            align="center"
            justify="space-between"
            borderRadius="16px"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            p="16px"
            gap="12px"
          >
            <Box>
              <Text fontSize="14px" fontWeight="600">
                {selectedSeats.length} seat{selectedSeats.length === 1 ? "" : "s"} selected
              </Text>
              {total > 0 ? (
                <Text fontSize="14px" color="gray.500">
                  Total: ₹{total.toFixed(2)}
                </Text>
              ) : null}
            </Box>
            <PrimaryButton w="auto" px="24px" onClick={submit} isDisabled={booking}>
              {booking ? "Booking…" : "Book Seats"}
            </PrimaryButton>
          </Flex>
          {error ? (
            <Text mt="8px" fontSize="14px" color="red.500">
              {error}
            </Text>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
