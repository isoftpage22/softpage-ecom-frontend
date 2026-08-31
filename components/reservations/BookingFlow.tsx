"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Flex, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useRequireStorefrontAuth } from "@/lib/auth/useRequireStorefrontAuth";
import { useGetMeQuery } from "@/store/api/storefrontAuthApi";
import {
  useCreateReservationMutation,
  useConfirmReservationDepositMutation,
  useGetAvailabilityQuery,
  useGetBookablesQuery,
  useGetResourcesQuery,
  useInitiateReservationDepositMutation,
  type AvailabilitySlot,
  type Reservation,
} from "@/store/api/reservationsApi";
import { openRazorpayCheckout, cleanupRazorpayCheckout } from "@/lib/payments/loadRazorpay";
import { StayBookingFlow } from "./StayBookingFlow";
import { EventBookingFlow } from "./EventBookingFlow";
import { SeatedBookingFlow } from "./SeatedBookingFlow";
import {
  BookingPage,
  BookingSuccess,
  ChoiceChip,
  DateStrip,
  FlowSection,
  NotesField,
  PrimaryButton,
  SignInGate,
  apiErrorMessage,
  localISODate,
} from "./bookingChrome";

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Customer booking flow.
 *  - TIME_SLOT: resource → date → slot → confirm.
 *  - TABLE: party size → date → slot → confirm; backend auto-assigns table.
 */
export function BookingFlow({ bookableId }: { bookableId: string }) {
  const businessId = useBusinessId();
  const { data: allBookables, isLoading } = useGetBookablesQuery({ businessId });
  const strategy = allBookables?.find((b) => b.id === bookableId)?.allocationStrategy;

  if (isLoading || !allBookables) {
    return (
      <BookingPage>
        <Skeleton h="28px" w="60%" borderRadius="8px" />
        <Skeleton mt="12px" h="16px" w="80%" borderRadius="8px" />
        <Skeleton mt="32px" h="44px" borderRadius="12px" />
      </BookingPage>
    );
  }

  if (strategy === "DATE_RANGE") {
    return <StayBookingFlow bookableId={bookableId} />;
  }
  if (strategy === "CAPACITY_POOL") {
    return <EventBookingFlow bookableId={bookableId} />;
  }
  if (strategy === "SEATED_INVENTORY") {
    return <SeatedBookingFlow bookableId={bookableId} />;
  }
  return <SlotBookingFlow bookableId={bookableId} />;
}

function SlotBookingFlow({ bookableId }: { bookableId: string }) {
  const businessId = useBusinessId();
  const { loggedIn, promptLogin } = useRequireStorefrontAuth(`/book/${bookableId}`);
  const searchParams = useSearchParams();
  const depositPaidReturn = searchParams.get("deposit") === "paid";
  const paymentCancelled = searchParams.get("payment") === "cancelled";

  const [resourceId, setResourceId] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState(() => localISODate());
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: bookables } = useGetBookablesQuery({ businessId });
  const bookable = bookables?.find((b) => b.id === bookableId);
  const isTable = bookable?.allocationStrategy === "TABLE";

  const { data: resources, isLoading: resourcesLoading } = useGetResourcesQuery(
    { businessId, bookableId },
    { skip: isTable },
  );

  const { data: slots, isFetching: slotsLoading } = useGetAvailabilityQuery(
    {
      businessId,
      bookableId,
      resourceId: isTable ? undefined : resourceId,
      date,
      partySize: isTable ? partySize : undefined,
    },
    { skip: (!resourceId && !isTable) || !date },
  );

  const { data: me } = useGetMeQuery(undefined, { skip: !loggedIn });

  const [createReservation, { isLoading: booking }] = useCreateReservationMutation();
  const [initiateDeposit] = useInitiateReservationDepositMutation();
  const [confirmDeposit] = useConfirmReservationDepositMutation();
  const [paying, setPaying] = useState(false);

  useEffect(() => () => cleanupRazorpayCheckout(), []);

  useEffect(() => {
    if (paymentCancelled) {
      setError(
        "Payment cancelled — your table is still held. Pay the cover charge to confirm.",
      );
    }
  }, [paymentCancelled]);

  useEffect(() => {
    if (isTable || resourceId || !resources || resources.length !== 1) return;
    setResourceId(resources[0].id);
  }, [isTable, resourceId, resources]);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return localISODate(d);
  }, []);

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const fmtFull = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const collectDeposit = async (reservation: Reservation) => {
    setPaying(true);
    try {
      const init = await initiateDeposit({ id: reservation.id }).unwrap();
      if (init.paymentPageUrl) {
        window.location.replace(init.paymentPageUrl);
        return;
      }
      if (!init.razorpayKeyId) {
        setPaying(false);
        setError("Could not start the cover-charge payment.");
        return;
      }
      await openRazorpayCheckout({
        key: init.razorpayKeyId,
        amount: Math.round(init.amount * 100),
        currency: init.currency || "INR",
        name: bookable?.name || "Reservation",
        description: "Reservation cover charge",
        order_id: init.razorpayOrderId,
        prefill: {
          name: me?.profile?.displayName || me?.profile?.firstName || undefined,
          email: me?.identity?.email || me?.profile?.email || undefined,
          contact: me?.identity?.phone || undefined,
        },
        handler: async (response) => {
          try {
            const res = await confirmDeposit({
              id: reservation.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();
            setConfirmed(res.reservation);
          } catch {
            setError(
              "Payment received but confirmation failed — please contact the store.",
            );
          } finally {
            setPaying(false);
          }
        },
        onDismiss: () => {
          setPaying(false);
          setError(
            "Payment cancelled — your table is still held. Pay the cover charge to confirm.",
          );
        },
        onFailed: (message) => {
          setPaying(false);
          setError(message);
        },
      });
    } catch (e: unknown) {
      setPaying(false);
      setError(apiErrorMessage(e, "Could not start the cover-charge payment."));
    }
  };

  const submit = async () => {
    if (!slot) return;
    setError(null);
    try {
      const reservation = await createReservation({
        businessId,
        bookableId,
        resourceId: isTable ? undefined : resourceId,
        startTime: slot.startTime,
        customerName: me?.profile?.displayName || me?.profile?.firstName || undefined,
        customerPhone: me?.identity?.phone || undefined,
        customerEmail: me?.identity?.email || me?.profile?.email || undefined,
        partySize: isTable ? partySize : undefined,
        notes: notes || undefined,
      }).unwrap();
      if (
        reservation.status === "HELD" &&
        Number(reservation.depositAmount) > 0 &&
        !reservation.depositPaid
      ) {
        await collectDeposit(reservation);
        return;
      }
      setConfirmed(reservation);
    } catch (e: unknown) {
      setError(
        apiErrorMessage(e, "That slot may have just been taken — please pick another time."),
      );
    }
  };

  if (confirmed || depositPaidReturn) {
    const isHeld = confirmed?.status === "HELD";
    return (
      <BookingSuccess
        title={isHeld ? "Slot held for you" : "Booking confirmed!"}
        subtitle={`${bookable?.name || ""}${confirmed?.startTime ? ` · ${fmtFull(confirmed.startTime)}` : ""}`}
        extra={
          <>
            {depositPaidReturn ? (
              <Text mt="8px" fontSize="14px" color="green.700">
                Cover charge paid. Your booking is confirmed.
              </Text>
            ) : null}
            {isHeld && confirmed?.holdExpiresAt ? (
              <Text mt="8px" fontSize="14px" color="orange.600">
                Your slot is held until {fmtTime(confirmed.holdExpiresAt)}. It will be
                confirmed by the store or on payment.
              </Text>
            ) : null}
          </>
        }
        reference={confirmed?.id}
      />
    );
  }

  if (!loggedIn) {
    return (
      <SignInGate
        title="Sign in to book"
        message="You need an account to make a reservation."
        onSignIn={promptLogin}
      />
    );
  }

  return (
    <BookingPage>
      <Box
        bg="white"
        borderRadius="20px"
        overflow="hidden"
        border="1px solid"
        borderColor="blackAlpha.50"
        boxShadow="0 8px 28px rgba(15,23,42,0.06)"
      >
        {bookable?.imageUrl ? (
          <Box
            h="140px"
            bgImage={`url(${bookable.imageUrl})`}
            bgSize="cover"
            bgPos="center"
          />
        ) : null}
        <Box p="16px">
          <Text fontSize="20px" fontWeight="800" letterSpacing="-0.02em">
            {bookable?.name || "Book a slot"}
          </Text>
          {bookable?.description ? (
            <Text mt="6px" fontSize="14px" color="gray.500" noOfLines={3} lineHeight="1.5">
              {bookable.description}
            </Text>
          ) : null}
          <Flex mt="10px" gap="8px" wrap="wrap">
            {bookable?.durationMinutes ? (
              <Text
                fontSize="12px"
                fontWeight="700"
                color="gray.600"
                bg="gray.50"
                px="10px"
                h="28px"
                lineHeight="28px"
                borderRadius="full"
              >
                {bookable.durationMinutes} min sitting
              </Text>
            ) : null}
            <Text
              fontSize="12px"
              fontWeight="700"
              color="gray.600"
              bg="gray.50"
              px="10px"
              h="28px"
              lineHeight="28px"
              borderRadius="full"
            >
              {bookable && Number(bookable.priceAmount) > 0
                ? `₹${Number(bookable.priceAmount).toFixed(0)} cover`
                : "Complimentary"}
            </Text>
          </Flex>
        </Box>
      </Box>

      {isTable ? (
        <FlowSection step={1} title="How many guests?">
          <Flex mt="14px" wrap="wrap" gap="8px">
            {PARTY_SIZES.map((n) => (
              <ChoiceChip
                key={n}
                square
                selected={partySize === n}
                onClick={() => {
                  setPartySize(n);
                  setSlot(null);
                }}
              >
                {n}
              </ChoiceChip>
            ))}
          </Flex>
          <Text mt="10px" fontSize="12px" color="gray.500">
            We’ll seat you at the best table for a party of {partySize}.
          </Text>
        </FlowSection>
      ) : (
        <FlowSection step={1} title="Choose">
          {resourcesLoading ? (
            <Skeleton mt="14px" h="48px" borderRadius="12px" />
          ) : (resources || []).length === 0 ? (
            <Text mt="14px" fontSize="14px" color="gray.500">
              Nothing available to book yet.
            </Text>
          ) : (
            <Flex mt="14px" wrap="wrap" gap="8px">
              {(resources || []).map((r) => (
                <ChoiceChip
                  key={r.id}
                  selected={resourceId === r.id}
                  onClick={() => {
                    setResourceId(r.id);
                    setSlot(null);
                  }}
                >
                  {r.name}
                </ChoiceChip>
              ))}
            </Flex>
          )}
        </FlowSection>
      )}

      {resourceId || isTable ? (
        <FlowSection step={2} title="Pick a date">
          <DateStrip
            value={date}
            min={localISODate()}
            max={maxDate}
            onChange={(next) => {
              setDate(next);
              setSlot(null);
            }}
          />
        </FlowSection>
      ) : null}

      {(resourceId || isTable) && date ? (
        <FlowSection step={3} title="Pick a time">
          {slotsLoading ? (
            <SimpleGrid mt="14px" columns={{ base: 3, sm: 4 }} gap="8px">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} h="42px" borderRadius="12px" />
              ))}
            </SimpleGrid>
          ) : (slots || []).length === 0 ? (
            <Text mt="14px" fontSize="14px" color="gray.500">
              No open slots on this date — try another day.
            </Text>
          ) : (
            <SimpleGrid mt="14px" columns={{ base: 3, sm: 4 }} gap="8px">
              {(slots || []).map((s) => (
                <ChoiceChip
                  key={s.startTime}
                  selected={slot?.startTime === s.startTime}
                  onClick={() => setSlot(s)}
                >
                  {fmtTime(s.startTime)}
                </ChoiceChip>
              ))}
            </SimpleGrid>
          )}
        </FlowSection>
      ) : null}

      {slot ? (
        <FlowSection step={4} title="Confirm">
          <Box
            mt="14px"
            borderRadius="14px"
            bg="gray.50"
            p="14px"
            border="1px solid"
            borderColor="blackAlpha.50"
          >
            <Text fontSize="15px" fontWeight="700">
              {bookable?.name}
            </Text>
            <Text mt="4px" fontSize="14px" color="gray.600">
              {fmtFull(slot.startTime)}
              {isTable ? ` · ${partySize} guests` : ""}
            </Text>
            <NotesField
              value={notes}
              onChange={setNotes}
              placeholder="Notes for the restaurant (optional)"
            />
            {error ? (
              <Text mt="8px" fontSize="14px" color="red.500">
                {error}
              </Text>
            ) : null}
            <PrimaryButton mt="16px" onClick={submit} isDisabled={booking || paying}>
              {paying ? "Opening payment…" : booking ? "Booking…" : "Confirm booking"}
            </PrimaryButton>
            <Text mt="8px" textAlign="center" fontSize="12px" color="gray.400">
              A small cover charge may apply and will be collected securely to confirm
              your table.
            </Text>
          </Box>
        </FlowSection>
      ) : null}
    </BookingPage>
  );
}
