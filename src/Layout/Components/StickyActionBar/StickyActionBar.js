"use client";

import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import React from "react";
import { vibrateTap } from "@/lib/haptics";

const RAISED =
  "8px 8px 18px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.95)";
const PRESSED =
  "inset 5px 5px 12px rgba(163,177,198,0.55), inset -4px -4px 10px rgba(255,255,255,0.9)";
const CTA_RAISED =
  "5px 5px 10px rgba(0,0,0,0.32), -2px -2px 6px rgba(255,255,255,0.18)";
const CTA_PRESSED = "inset 3px 3px 8px rgba(0,0,0,0.55)";

/**
 * Floating neumorphic bottom bar used by View Cart and Place Order.
 * Safe-area aware so it does not sit under the iPhone home indicator.
 */
export default function StickyActionBar({
  leftTitle,
  leftSubtitle,
  actionLabel,
  onClick,
  disabled = false,
  busy = false,
  leftLoading = false,
}) {
  const handleClick = (event) => {
    if (disabled || busy) {
      event.preventDefault();
      return;
    }
    vibrateTap(16);
    onClick?.(event);
  };

  return (
    <Box
      position="fixed"
      left="0"
      right="0"
      bottom="calc(16px + env(safe-area-inset-bottom, 0px))"
      zIndex={30}
      px="16px"
      bg="transparent"
      pointerEvents="none"
    >
      <Flex
        as="button"
        type="button"
        pointerEvents="auto"
        onClick={handleClick}
        disabled={disabled || busy}
        w="100%"
        minH="68px"
        align="center"
        justify="space-between"
        gap="14px"
        px="18px"
        py="14px"
        borderRadius="24px"
        bg="#eceff4"
        border="1px solid rgba(255,255,255,0.85)"
        boxShadow={RAISED}
        cursor={busy ? "wait" : disabled ? "not-allowed" : "pointer"}
        opacity={disabled && !busy ? 0.55 : 1}
        transition="box-shadow 0.12s ease, transform 0.12s ease"
        _active={
          disabled || busy
            ? undefined
            : {
                transform: "scale(0.978)",
                boxShadow: PRESSED,
                "& > span": { boxShadow: CTA_PRESSED, transform: "scale(0.97)" },
              }
        }
        sx={{
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
          userSelect: "none",
        }}
      >
        <Box textAlign="left" minW="0" flex="1">
          <Flex align="center" gap="8px" minH="20px">
            {leftLoading ? (
              <Spinner size="xs" thickness="2px" color="gray.500" speed="0.7s" flexShrink={0} />
            ) : null}
            <Text
              fontSize="17px"
              fontWeight="800"
              color="#111"
              lineHeight="1.2"
              letterSpacing="0"
              textTransform="none"
              noOfLines={1}
              opacity={leftLoading ? 0.45 : 1}
              transition="opacity 0.15s ease"
            >
              {leftTitle}
            </Text>
          </Flex>
          {leftSubtitle ? (
            <Text
              fontSize="12px"
              fontWeight="500"
              color="#667085"
              mt="3px"
              letterSpacing="0"
              textTransform="none"
              noOfLines={1}
            >
              {leftSubtitle}
            </Text>
          ) : null}
        </Box>
        <Flex
          as="span"
          align="center"
          justify="center"
          flexShrink={0}
          minH="48px"
          minW="124px"
          px="18px"
          borderRadius="16px"
          bg="#111"
          color="white"
          boxShadow={CTA_RAISED}
          fontSize="14px"
          fontWeight="800"
          letterSpacing="0.02em"
          textTransform="none"
          whiteSpace="nowrap"
          transition="box-shadow 0.12s ease, transform 0.12s ease"
        >
          {actionLabel}
        </Flex>
      </Flex>
    </Box>
  );
}
