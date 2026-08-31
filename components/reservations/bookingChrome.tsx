"use client";

import { useMemo } from "react";
import type { ButtonProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Link } from "@/src/lib/nav";
import { CHROME_BAR_BG, CHROME_SURFACE } from "@/lib/menu/storeChrome";

export const BOOKING_PRIMARY = CHROME_BAR_BG;

const chipReset = {
  variant: "ghost" as const,
  overflow: "visible",
  minW: "auto",
  textTransform: "none" as const,
  letterSpacing: "0",
};

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}

export function localISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return localISODate(new Date(y, m - 1, d + n));
}

export function StepHeading({
  step,
  children,
}: {
  step: number;
  children: ReactNode;
}) {
  return (
    <Flex align="center" gap="10px">
      <Flex
        h="22px"
        w="22px"
        align="center"
        justify="center"
        borderRadius="full"
        bg={BOOKING_PRIMARY}
        color="white"
        fontSize="11px"
        fontWeight="800"
        flexShrink={0}
      >
        {step}
      </Flex>
      <Text
        fontSize="13px"
        fontWeight="700"
        letterSpacing="0.02em"
        color="gray.800"
      >
        {children}
      </Text>
    </Flex>
  );
}

export function ChoiceChip({
  selected,
  onClick,
  children,
  disabled,
  square,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  square?: boolean;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      isDisabled={disabled}
      {...chipReset}
      h={square ? "48px" : "auto"}
      w={square ? "48px" : "auto"}
      minH={square ? "48px" : "42px"}
      minW={square ? "48px" : "auto"}
      px={square ? 0 : "14px"}
      py={square ? 0 : "10px"}
      borderRadius="12px"
      fontSize={square ? "16px" : "13px"}
      fontWeight="700"
      bg={selected ? BOOKING_PRIMARY : "white"}
      color={selected ? "white" : "gray.700"}
      border="1px solid"
      borderColor={selected ? BOOKING_PRIMARY : "gray.200"}
      boxShadow={selected ? "0 4px 12px rgba(0,0,0,0.12)" : "none"}
      _hover={{ bg: selected ? BOOKING_PRIMARY : "gray.50" }}
      _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
    >
      {children}
    </Button>
  );
}

export function DateStrip({
  value,
  min,
  max,
  days = 14,
  onChange,
}: {
  value: string;
  min?: string;
  max?: string;
  days?: number;
  onChange: (value: string) => void;
}) {
  const start = min || localISODate();
  const today = localISODate();
  const items = useMemo(() => {
    const out: { iso: string; weekday: string; day: number }[] = [];
    for (let i = 0; i < days; i++) {
      const iso = addDays(start, i);
      if (max && iso > max) break;
      const [y, m, d] = iso.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      out.push({
        iso,
        weekday:
          iso === today
            ? "Today"
            : dt.toLocaleDateString("en-IN", { weekday: "short" }),
        day: dt.getDate(),
      });
    }
    return out;
  }, [start, max, days, today]);

  return (
    <Flex
      mt="12px"
      gap="8px"
      overflowX="auto"
      pb="4px"
      mx="-4px"
      px="4px"
      sx={{
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      {items.map((d) => {
        const selected = d.iso === value;
        return (
          <Button
            key={d.iso}
            type="button"
            onClick={() => onChange(d.iso)}
            {...chipReset}
            flexShrink={0}
            h="68px"
            w="58px"
            minW="58px"
            px={0}
            flexDir="column"
            gap="4px"
            borderRadius="14px"
            bg={selected ? BOOKING_PRIMARY : "white"}
            color={selected ? "white" : "gray.800"}
            border="1px solid"
            borderColor={selected ? BOOKING_PRIMARY : "gray.200"}
            boxShadow={selected ? "0 6px 16px rgba(0,0,0,0.14)" : "none"}
            _hover={{ bg: selected ? BOOKING_PRIMARY : "gray.50" }}
          >
            <Box
              as="span"
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.04em"
              textTransform="uppercase"
              opacity={0.75}
            >
              {d.weekday}
            </Box>
            <Box as="span" fontSize="20px" fontWeight="800" lineHeight="1">
              {d.day}
            </Box>
          </Button>
        );
      })}
    </Flex>
  );
}

export function FlowSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <Box
      as="section"
      mt="14px"
      bg="white"
      borderRadius="18px"
      p="16px"
      border="1px solid"
      borderColor="blackAlpha.50"
      boxShadow="0 1px 2px rgba(0,0,0,0.04)"
    >
      <StepHeading step={step}>{title}</StepHeading>
      {children}
    </Box>
  );
}

export function PrimaryButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      type="button"
      {...chipReset}
      w="100%"
      h="48px"
      minH="48px"
      bg={BOOKING_PRIMARY}
      color="white"
      borderRadius="12px"
      fontSize="15px"
      fontWeight="700"
      _hover={{ bg: BOOKING_PRIMARY, opacity: 0.92 }}
      _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function ConfirmCard({ children }: { children: ReactNode }) {
  return (
    <Box
      mt="12px"
      borderRadius="16px"
      border="1px solid"
      borderColor="gray.200"
      bg="gray.50"
      p="16px"
    >
      {children}
    </Box>
  );
}

export function NotesField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Textarea
      mt="12px"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      borderRadius="12px"
      bg="white"
      fontSize="14px"
      borderColor="gray.200"
      _focus={{ borderColor: "gray.400", boxShadow: "none" }}
    />
  );
}

export function DateInput({
  value,
  min,
  max,
  onChange,
}: {
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box
      as="input"
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      mt="12px"
      display="block"
      w="100%"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="12px"
      bg="white"
      px="16px"
      py="10px"
      fontSize="14px"
    />
  );
}

export function BookingPage({ children }: { children: ReactNode }) {
  return (
    <Box
      maxW="2xl"
      mx="auto"
      px="16px"
      py="20px"
      pb="56px"
      minH="calc(100vh - 56px)"
      bg="gray.50"
    >
      {children}
    </Box>
  );
}

export function BookingSuccess({
  title,
  subtitle,
  extra,
  reference,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  reference?: string;
}) {
  return (
    <Box
      maxW="lg"
      mx="auto"
      px="16px"
      py="64px"
      textAlign="center"
      minH="calc(100vh - 56px)"
      bg="gray.50"
    >
      <Flex
        mx="auto"
        mb="16px"
        h="64px"
        w="64px"
        align="center"
        justify="center"
        borderRadius="full"
        bg="green.100"
        fontSize="28px"
        color="green.700"
      >
        ✓
      </Flex>
      <Text fontSize="22px" fontWeight="800" color="gray.900">
        {title}
      </Text>
      {subtitle ? (
        <Text mt="8px" color="gray.600">
          {subtitle}
        </Text>
      ) : null}
      {extra}
      {reference ? (
        <Text mt="8px" fontSize="12px" color="gray.400" letterSpacing="0.04em">
          REF {reference.slice(0, 8).toUpperCase()}
        </Text>
      ) : null}
      <Flex mt="32px" justify="center" gap="12px" flexWrap="wrap">
        <Box
          as={Link}
          href="/bookings"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          h="48px"
          px="24px"
          bg={BOOKING_PRIMARY}
          color="white"
          borderRadius="12px"
          fontSize="14px"
          fontWeight="700"
          textDecoration="none"
        >
          My Bookings
        </Box>
        <Box
          as={Link}
          href="/"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          h="48px"
          px="24px"
          bg="white"
          color="gray.700"
          border="1px solid"
          borderColor="gray.300"
          borderRadius="12px"
          fontSize="14px"
          fontWeight="700"
          textDecoration="none"
        >
          Back to menu
        </Box>
      </Flex>
    </Box>
  );
}

export function SignInGate({
  title,
  message,
  onSignIn,
}: {
  title: string;
  message: string;
  onSignIn: () => void;
}) {
  return (
    <Box
      maxW="lg"
      mx="auto"
      px="24px"
      py="72px"
      textAlign="center"
      minH="calc(100vh - 56px)"
      bg={CHROME_SURFACE}
    >
      <Flex
        mx="auto"
        mb="20px"
        h="56px"
        w="56px"
        align="center"
        justify="center"
        borderRadius="full"
        bg="gray.100"
        fontSize="22px"
      >
        📅
      </Flex>
      <Text fontSize="22px" fontWeight="800">
        {title}
      </Text>
      <Text mt="8px" color="gray.600" fontSize="15px" lineHeight="1.5">
        {message}
      </Text>
      <PrimaryButton mt="24px" maxW="280px" mx="auto" onClick={onSignIn}>
        Sign In
      </PrimaryButton>
    </Box>
  );
}
