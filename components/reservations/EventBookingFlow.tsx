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
  type Reservation,
} from "@/store/api/reservationsApi";
import {
  BookingPage,
  BookingSuccess,
  ConfirmCard,
  NotesField,
  PrimaryButton,
  SignInGate,
  StepHeading,
  apiErrorMessage,
  BOOKING_PRIMARY,
} from "./bookingChrome";

export function EventBookingFlow({ bookableId }: { bookableId: string }) {
  const businessId = useBusinessId();
  const { loggedIn, promptLogin } = useRequireStorefrontAuth(`/book/${bookableId}`);

  const [occurrenceId, setOccurrenceId] = useState("");
  const [seats, setSeats] = useState(1);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: bookables } = useGetBookablesQuery({ businessId });
  const bookable = bookables?.find((b) => b.id === bookableId);

  const { data: occurrences, isLoading } = useGetOccurrencesQuery({
    businessId,
    bookableId,
  });

  const { data: me } = useGetMeQuery(undefined, { skip: !loggedIn });
  const [createReservation, { isLoading: booking }] = useCreateReservationMutation();

  const selected = occurrences?.find((o) => o.id === occurrenceId);
  const price = Number(bookable?.priceAmount || 0);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const submit = async () => {
    if (!occurrenceId) return;
    setError(null);
    try {
      const reservation = await createReservation({
        businessId,
        bookableId,
        eventOccurrenceId: occurrenceId,
        partySize: seats,
        customerName: me?.profile?.displayName || me?.profile?.firstName || undefined,
        customerPhone: me?.identity?.phone || undefined,
        customerEmail: me?.identity?.email || me?.profile?.email || undefined,
        notes: notes || undefined,
      }).unwrap();
      setConfirmed(reservation);
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "This event may have just sold out — try another one."));
    }
  };

  if (confirmed) {
    const isHeld = confirmed.status === "HELD";
    return (
      <BookingSuccess
        title={isHeld ? "Seats held for you" : "You're registered!"}
        subtitle={`${bookable?.name || ""} · ${fmt(confirmed.startTime)}${seats > 1 ? ` · ${seats} seats` : ""}`}
        extra={
          selected?.deliveryType === "VIRTUAL" ? (
            <Text mt="8px" fontSize="14px" color="gray.500">
              This is a virtual event — your join link is in My Bookings and in your
              confirmation message.
            </Text>
          ) : null
        }
        reference={confirmed.id}
      />
    );
  }

  if (!loggedIn) {
    return (
      <SignInGate
        title="Sign in to register"
        message="You need an account to book this event."
        onSignIn={promptLogin}
      />
    );
  }

  return (
    <BookingPage>
      <Text fontSize="22px" fontWeight="800">
        {bookable?.name || "Book an event"}
      </Text>
      {bookable?.description ? (
        <Text mt="4px" fontSize="14px" color="gray.500">
          {bookable.description}
        </Text>
      ) : null}

      <Box as="section" mt="32px">
        <StepHeading step={1}>Pick a session</StepHeading>
        {isLoading ? (
          <Box mt="12px" h="64px" borderRadius="12px" bg="gray.100" />
        ) : (occurrences || []).length === 0 ? (
          <Text mt="12px" fontSize="14px" color="gray.500">
            No upcoming sessions right now.
          </Text>
        ) : (
          <Flex mt="12px" direction="column" gap="8px">
            {(occurrences || []).map((occ) => {
              const remaining = occ.capacity - occ.bookedCount;
              const soldOut = remaining <= 0;
              const selectedOcc = occurrenceId === occ.id;
              return (
                <Box
                  key={occ.id}
                  as="button"
                  type="button"
                  disabled={soldOut}
                  onClick={() => setOccurrenceId(occ.id)}
                  display="flex"
                  w="100%"
                  alignItems="center"
                  justifyContent="space-between"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor={selectedOcc ? BOOKING_PRIMARY : "gray.200"}
                  bg={selectedOcc ? BOOKING_PRIMARY : "white"}
                  color={soldOut ? "gray.400" : selectedOcc ? "white" : "gray.700"}
                  px="16px"
                  py="12px"
                  textAlign="left"
                  fontSize="14px"
                  cursor={soldOut ? "not-allowed" : "pointer"}
                  opacity={soldOut ? 0.6 : 1}
                >
                  <Text as="span" fontWeight="600">
                    {fmt(occ.startTime)}
                    {occ.deliveryType === "VIRTUAL" ? " · Online" : ""}
                  </Text>
                  <Text as="span" color={selectedOcc ? "whiteAlpha.800" : "gray.400"}>
                    {soldOut ? "Sold out" : `${remaining} seat${remaining === 1 ? "" : "s"} left`}
                  </Text>
                </Box>
              );
            })}
          </Flex>
        )}
      </Box>

      {selected ? (
        <Box as="section" mt="32px">
          <StepHeading step={2}>Confirm</StepHeading>
          <ConfirmCard>
            <Flex align="flex-end" gap="16px">
              <Box>
                <Text fontSize="12px" color="gray.500">
                  Seats
                </Text>
                <Box
                  as="input"
                  type="number"
                  min={1}
                  max={selected.capacity - selected.bookedCount}
                  value={seats}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSeats(Math.max(1, Number(e.target.value) || 1))
                  }
                  mt="4px"
                  display="block"
                  w="96px"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="12px"
                  bg="white"
                  px="16px"
                  py="10px"
                  fontSize="14px"
                />
              </Box>
              {price > 0 ? (
                <Text pb="8px" fontSize="14px" fontWeight="700">
                  Total: ₹{(price * seats).toFixed(2)}
                </Text>
              ) : null}
            </Flex>
            <NotesField value={notes} onChange={setNotes} placeholder="Notes (optional)" />
            {error ? (
              <Text mt="8px" fontSize="14px" color="red.500">
                {error}
              </Text>
            ) : null}
            <PrimaryButton mt="16px" onClick={submit} isDisabled={booking}>
              {booking ? "Booking…" : "Register"}
            </PrimaryButton>
          </ConfirmCard>
        </Box>
      ) : null}
    </BookingPage>
  );
}
