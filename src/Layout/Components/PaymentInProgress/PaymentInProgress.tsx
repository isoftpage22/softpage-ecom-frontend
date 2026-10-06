"use client";

import { useState } from "react";
import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import type { PaymentBusy } from "@/lib/checkout/usePaymentInProgress";

function formatAmount(amount: number | null, currency: string): string | null {
  if (amount == null || !Number.isFinite(Number(amount))) return null;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `₹${Number(amount)}`;
  }
}

export default function PaymentInProgress({
  amount,
  currency,
  busy,
  bankConfirming,
  notice,
  onContinue,
  onCancel,
}: {
  amount: number | null;
  currency: string;
  busy: PaymentBusy;
  bankConfirming: boolean;
  notice?: string | null;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const label = formatAmount(amount, currency);
  const working = busy != null;

  return (
    <Flex direction="column" minH="100vh" bg="#f4f4f5">
      <Box bg="#111" color="white" px="16px" py="14px">
        <Text fontSize="16px" fontWeight="700">
          Payment
        </Text>
      </Box>
      <Flex
        direction="column"
        align="center"
        justify="center"
        flex="1"
        px="24px"
        py="40px"
        textAlign="center"
      >
        <Spinner thickness="3px" speed="0.7s" color="#111" size="lg" />
        <Text mt="20px" fontSize="20px" fontWeight="700" color="#111">
          Payment in progress
        </Text>
        {label ? (
          <Text mt="6px" fontSize="16px" fontWeight="600" color="#111">
            {label}
          </Text>
        ) : null}
        <Text mt="10px" fontSize="14px" lineHeight="20px" color="#4b5563" maxW="320px">
          If you already paid in your UPI app, keep this page open. We&apos;ll confirm in a few
          seconds.
        </Text>

        {bankConfirming ? (
          <Box mt="20px" bg="#FFFBEB" border="1px solid #F6E05E" borderRadius="14px" px="16px" py="12px" maxW="320px">
            <Text fontSize="13px" fontWeight="700" color="#744210">
              Your bank is confirming this payment
            </Text>
            <Text mt="4px" fontSize="13px" color="#744210">
              It can&apos;t be cancelled now. We&apos;ll open your order as soon as it finishes.
            </Text>
          </Box>
        ) : null}

        {notice ? (
          <Text mt="16px" fontSize="13px" color="#9B2C2C" maxW="320px">
            {notice}
          </Text>
        ) : null}

        {!bankConfirming ? (
          <Box mt="28px" w="100%" maxW="320px">
            <Button
              w="100%"
              h="48px"
              bg="#111"
              color="white"
              borderRadius="14px"
              fontWeight="700"
              _hover={{ bg: "#000" }}
              isLoading={busy === "resume"}
              isDisabled={working}
              onClick={onContinue}
            >
              Continue payment
            </Button>
            {confirmingCancel ? (
              <Flex mt="10px" gap="8px">
                <Button
                  flex="1"
                  h="48px"
                  variant="outline"
                  borderColor="#111"
                  borderRadius="14px"
                  fontWeight="700"
                  isDisabled={working}
                  onClick={() => setConfirmingCancel(false)}
                >
                  Keep payment
                </Button>
                <Button
                  flex="1"
                  h="48px"
                  bg="#9B2C2C"
                  color="white"
                  borderRadius="14px"
                  fontWeight="700"
                  _hover={{ bg: "#822727" }}
                  isLoading={busy === "cancel"}
                  isDisabled={working}
                  onClick={onCancel}
                >
                  Cancel payment
                </Button>
              </Flex>
            ) : (
              <Button
                mt="10px"
                w="100%"
                h="48px"
                variant="outline"
                borderColor="#E5E7EB"
                borderRadius="14px"
                fontWeight="700"
                color="#111"
                isDisabled={working}
                onClick={() => setConfirmingCancel(true)}
              >
                Cancel payment
              </Button>
            )}
          </Box>
        ) : null}
      </Flex>
    </Flex>
  );
}
