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

const buttonReset = {
  variant: "unstyled" as const,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "100%",
  h: "48px",
  borderRadius: "14px",
  fontWeight: "700",
  fontSize: "15px",
  lineHeight: "20px",
  sx: { textTransform: "none", WebkitTapHighlightColor: "transparent" },
};

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
    <Flex direction="column" minH="100dvh" bg="#F4F4F5">
      <Box
        bg="#111"
        px="16px"
        pt="calc(14px + env(safe-area-inset-top, 0px))"
        pb="14px"
      >
        <Text color="#fff" fontSize="16px" fontWeight="700" sx={{ textTransform: "none" }}>
          Payment
        </Text>
      </Box>
      <Flex flex="1" align="center" justify="center" px="20px" py="32px">
        <Box
          w="100%"
          maxW="360px"
          bg="#fff"
          borderRadius="20px"
          px="22px"
          py="28px"
          textAlign="center"
          boxShadow="0 8px 28px rgba(17, 17, 17, 0.08)"
        >
          <Flex justify="center" mb="16px">
            <Spinner thickness="3px" speed="0.7s" color="#111" size="md" />
          </Flex>
          <Text fontSize="20px" fontWeight="700" color="#111" sx={{ textTransform: "none" }}>
            Payment in progress
          </Text>
          {label ? (
            <Text mt="6px" fontSize="18px" fontWeight="700" color="#111">
              {label}
            </Text>
          ) : null}
          <Text mt="10px" fontSize="14px" lineHeight="20px" color="#4B5563">
            If you already paid in your UPI app, keep this page open. We&apos;ll confirm in a few
            seconds.
          </Text>

          {bankConfirming ? (
            <Box mt="20px" bg="#FFFBEB" border="1px solid #F6E05E" borderRadius="14px" px="16px" py="12px">
              <Text fontSize="13px" fontWeight="700" color="#744210" sx={{ textTransform: "none" }}>
                Your bank is confirming this payment
              </Text>
              <Text mt="4px" fontSize="13px" color="#744210">
                It can&apos;t be cancelled now. We&apos;ll open your order as soon as it finishes.
              </Text>
            </Box>
          ) : null}

          {notice ? (
            <Text mt="16px" fontSize="13px" color="#9B2C2C">
              {notice}
            </Text>
          ) : null}

          {!bankConfirming ? (
            <Box mt="24px">
              <Button
                {...buttonReset}
                bg="#111"
                color="#fff"
                _hover={{ bg: "#000", color: "#fff" }}
                _active={{ bg: "#000" }}
                _disabled={{ opacity: 0.55, bg: "#111", color: "#fff", cursor: "not-allowed" }}
                isLoading={busy === "resume"}
                spinner={<Spinner size="sm" color="#fff" />}
                isDisabled={working}
                onClick={onContinue}
              >
                Continue payment
              </Button>
              {confirmingCancel ? (
                <Flex mt="10px" gap="8px">
                  <Button
                    {...buttonReset}
                    flex="1"
                    bg="#fff"
                    color="#111"
                    border="1px solid #D1D5DB"
                    _hover={{ bg: "#F9FAFB", color: "#111" }}
                    _disabled={{ opacity: 0.55, bg: "#fff", color: "#6B7280", cursor: "not-allowed" }}
                    isDisabled={working}
                    onClick={() => setConfirmingCancel(false)}
                  >
                    Keep payment
                  </Button>
                  <Button
                    {...buttonReset}
                    flex="1"
                    bg="#B91C1C"
                    color="#fff"
                    _hover={{ bg: "#991B1B", color: "#fff" }}
                    _disabled={{ opacity: 0.55, bg: "#B91C1C", color: "#fff", cursor: "not-allowed" }}
                    isLoading={busy === "cancel"}
                    spinner={<Spinner size="sm" color="#fff" />}
                    isDisabled={working}
                    onClick={onCancel}
                  >
                    Cancel payment
                  </Button>
                </Flex>
              ) : (
                <Button
                  {...buttonReset}
                  mt="10px"
                  bg="#fff"
                  color="#111"
                  border="1px solid #D1D5DB"
                  _hover={{ bg: "#F9FAFB", color: "#111" }}
                  _disabled={{ opacity: 0.55, bg: "#fff", color: "#6B7280", cursor: "not-allowed" }}
                  isDisabled={working}
                  onClick={() => setConfirmingCancel(true)}
                >
                  Cancel payment
                </Button>
              )}
            </Box>
          ) : null}
        </Box>
      </Flex>
    </Flex>
  );
}
