"use client";

import { Box, Button, Text } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { useGetJoinInfoQuery } from "@/store/api/reservationsApi";
import { ClientOnly } from "@/components/ClientOnly";
import { useHistory } from "@/src/lib/nav";
import { CHROME_SURFACE } from "@/lib/menu/storeChrome";
import { PrimaryButton } from "@/components/reservations/bookingChrome";

function JoinBody() {
  const params = useParams<{ token: string }>();
  const history = useHistory();
  const { data, isLoading, error } = useGetJoinInfoQuery({ token: params.token });

  const when = data?.startTime
    ? new Date(data.startTime).toLocaleString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <>
      <TopBarWithBackButton headerText="Join" backTo="/bookings" />
      <Box px={4} py={10} bg={CHROME_SURFACE} minH="70vh" textAlign="center">
        {isLoading ? (
          <Text color="gray.600">Loading…</Text>
        ) : error || !data ? (
          <>
            <Text fontSize="20px" fontWeight="800">
              This join link isn&apos;t valid
            </Text>
            <Text mt={2} color="gray.600">
              The link may have expired or the booking was cancelled.
            </Text>
            <Button mt={6} textTransform="none" onClick={() => history.push("/bookings")}>
              My Bookings
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="22px" fontWeight="800">
              {data.customerName ? `Welcome, ${data.customerName}` : "You're all set"}
            </Text>
            <Text mt={2} color="gray.600">
              {when}
            </Text>
            <Box mt={8} bg="white" borderRadius="16px" p={5} textAlign="left" boxShadow="sm">
              {data.joinUrl ? (
                <PrimaryButton as="a" href={data.joinUrl} target="_blank" rel="noopener noreferrer">
                  Join the event{data.provider ? ` on ${data.provider}` : ""}
                </PrimaryButton>
              ) : (
                <Text fontSize="14px" color="gray.500">
                  The meeting link hasn&apos;t been published yet — check back closer to the start time.
                </Text>
              )}
              {data.passcode ? (
                <Text mt={4} textAlign="center" fontSize="14px">
                  Passcode: <Box as="span" fontFamily="mono" fontWeight="700">{data.passcode}</Box>
                </Text>
              ) : null}
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

export default function JoinPage() {
  return (
    <ClientOnly>
      <JoinBody />
    </ClientOnly>
  );
}
