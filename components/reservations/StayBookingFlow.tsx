"use client";

import { useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useRequireStorefrontAuth } from "@/lib/auth/useRequireStorefrontAuth";
import { useGetMeQuery } from "@/store/api/storefrontAuthApi";
import {
  useCreateReservationMutation,
  useGetBookablesQuery,
  useGetCalendarQuery,
  useGetQuoteQuery,
  useGetResourcesQuery,
  type Reservation,
} from "@/store/api/reservationsApi";
import {
  BookingPage,
  BookingSuccess,
  ChoiceChip,
  ConfirmCard,
  DateInput,
  NotesField,
  PrimaryButton,
  SignInGate,
  StepHeading,
  apiErrorMessage,
} from "./bookingChrome";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function StayBookingFlow({ bookableId }: { bookableId: string }) {
  const businessId = useBusinessId();
  const { loggedIn, promptLogin } = useRequireStorefrontAuth(`/book/${bookableId}`);

  const [resourceId, setResourceId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: bookables } = useGetBookablesQuery({ businessId });
  const bookable = bookables?.find((b) => b.id === bookableId);

  const { data: resources, isLoading: resourcesLoading } = useGetResourcesQuery({
    businessId,
    bookableId,
  });

  const { data: calendar } = useGetCalendarQuery(
    { businessId, bookableId, resourceId, from: todayStr(), days: 60 },
    { skip: !resourceId },
  );

  const datesValid = Boolean(checkIn && checkOut && checkOut > checkIn);
  const { data: quote, isFetching: quoting } = useGetQuoteQuery(
    { businessId, bookableId, startDate: checkIn, endDate: checkOut },
    { skip: !datesValid },
  );

  const { data: me } = useGetMeQuery(undefined, { skip: !loggedIn });
  const [createReservation, { isLoading: booking }] = useCreateReservationMutation();

  const blockedDates = useMemo(
    () => new Set((calendar || []).filter((d) => !d.available).map((d) => d.date)),
    [calendar],
  );

  const conflictNights = useMemo(() => {
    if (!datesValid) return [];
    const out: string[] = [];
    for (
      let t = new Date(`${checkIn}T00:00:00Z`).getTime();
      t < new Date(`${checkOut}T00:00:00Z`).getTime();
      t += 86400000
    ) {
      const d = new Date(t).toISOString().slice(0, 10);
      if (blockedDates.has(d)) out.push(d);
    }
    return out;
  }, [datesValid, checkIn, checkOut, blockedDates]);

  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const submit = async () => {
    if (!datesValid || !resourceId) return;
    setError(null);
    try {
      const reservation = await createReservation({
        businessId,
        bookableId,
        resourceId,
        startTime: `${checkIn}T00:00:00.000Z`,
        endTime: `${checkOut}T00:00:00.000Z`,
        customerName: me?.profile?.displayName || me?.profile?.firstName || undefined,
        customerPhone: me?.identity?.phone || undefined,
        customerEmail: me?.identity?.email || me?.profile?.email || undefined,
        notes: notes || undefined,
      }).unwrap();
      setConfirmed(reservation);
    } catch (e: unknown) {
      setError(
        apiErrorMessage(e, "Those dates may have just been booked — try different dates."),
      );
    }
  };

  if (confirmed) {
    const isHeld = confirmed.status === "HELD";
    return (
      <BookingSuccess
        title={isHeld ? "Stay held for you" : "Stay booked!"}
        subtitle={`${bookable?.name || ""} · ${fmtDate(confirmed.startTime.slice(0, 10))} → ${fmtDate(confirmed.endTime.slice(0, 10))}`}
        reference={confirmed.id}
      />
    );
  }

  if (!loggedIn) {
    return (
      <SignInGate
        title="Sign in to book"
        message="You need an account to book a stay."
        onSignIn={promptLogin}
      />
    );
  }

  return (
    <BookingPage>
      <Text fontSize="22px" fontWeight="800">
        {bookable?.name || "Book a stay"}
      </Text>
      {bookable?.description ? (
        <Text mt="4px" fontSize="14px" color="gray.500">
          {bookable.description}
        </Text>
      ) : null}

      <Box as="section" mt="32px">
        <StepHeading step={1}>Choose your room</StepHeading>
        {resourcesLoading ? (
          <Box mt="12px" h="48px" borderRadius="12px" bg="gray.100" />
        ) : (resources || []).length === 0 ? (
          <Text mt="12px" fontSize="14px" color="gray.500">
            Nothing available to book yet.
          </Text>
        ) : (
          <Flex mt="12px" wrap="wrap" gap="8px">
            {(resources || []).map((r) => (
              <ChoiceChip
                key={r.id}
                selected={resourceId === r.id}
                onClick={() => setResourceId(r.id)}
              >
                {r.name}
              </ChoiceChip>
            ))}
          </Flex>
        )}
      </Box>

      {resourceId ? (
        <Box as="section" mt="32px">
          <StepHeading step={2}>Pick your dates</StepHeading>
          <Flex mt="4px" wrap="wrap" align="flex-end" gap="16px">
            <Box>
              <Text fontSize="12px" color="gray.500">
                Check-in
              </Text>
              <DateInput value={checkIn} min={todayStr()} onChange={setCheckIn} />
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.500">
                Check-out
              </Text>
              <DateInput
                value={checkOut}
                min={checkIn || todayStr()}
                onChange={setCheckOut}
              />
            </Box>
          </Flex>
          {conflictNights.length > 0 ? (
            <Text mt="8px" fontSize="14px" color="red.500">
              Not available on: {conflictNights.map(fmtDate).join(", ")}
            </Text>
          ) : null}
          {blockedDates.size > 0 && conflictNights.length === 0 ? (
            <Text mt="8px" fontSize="12px" color="gray.400">
              Unavailable nights in the next 60 days:{" "}
              {[...blockedDates].slice(0, 8).map(fmtDate).join(", ")}
              {blockedDates.size > 8 ? "…" : ""}
            </Text>
          ) : null}
        </Box>
      ) : null}

      {resourceId && datesValid && conflictNights.length === 0 ? (
        <Box as="section" mt="32px">
          <StepHeading step={3}>Confirm</StepHeading>
          <ConfirmCard>
            <Text fontSize="14px" fontWeight="600">
              {fmtDate(checkIn)} → {fmtDate(checkOut)}
              {quote ? ` · ${quote.nightCount} night${quote.nightCount === 1 ? "" : "s"}` : ""}
            </Text>
            {quoting ? (
              <Box mt="8px" h="20px" w="128px" borderRadius="8px" bg="gray.200" />
            ) : quote ? (
              <Box mt="8px" fontSize="14px" color="gray.600">
                {quote.nights.map((n) => (
                  <Flex key={n.date} justify="space-between">
                    <span>{fmtDate(n.date)}</span>
                    <span>₹{n.rate.toFixed(2)}</span>
                  </Flex>
                ))}
                <Flex
                  mt="4px"
                  justify="space-between"
                  borderTop="1px solid"
                  borderColor="gray.200"
                  pt="4px"
                  fontWeight="700"
                  color="gray.900"
                >
                  <span>Total</span>
                  <span>₹{quote.total.toFixed(2)}</span>
                </Flex>
              </Box>
            ) : null}
            <NotesField
              value={notes}
              onChange={setNotes}
              placeholder="Notes for the property (optional)"
            />
            {error ? (
              <Text mt="8px" fontSize="14px" color="red.500">
                {error}
              </Text>
            ) : null}
            <PrimaryButton mt="16px" onClick={submit} isDisabled={booking}>
              {booking ? "Booking…" : "Book Stay"}
            </PrimaryButton>
          </ConfirmCard>
        </Box>
      ) : null}
    </BookingPage>
  );
}
