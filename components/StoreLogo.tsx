"use client";

import { Box, Flex, Image, Text } from "@chakra-ui/react";

export function StoreLogo({
  src,
  name,
  size = "40px",
}: {
  src?: string | null;
  name: string;
  size?: string;
}) {
  const initial = (name || "S").trim().charAt(0).toUpperCase() || "S";
  if (src) {
    return (
      <Box
        border="1px solid"
        borderColor="whiteAlpha.400"
        borderRadius="4px"
        overflow="hidden"
        bg="white"
        boxSize={size}
        flexShrink={0}
      >
        <Image src={src} alt={name} boxSize={size} objectFit="contain" />
      </Box>
    );
  }
  return (
    <Flex
      boxSize={size}
      borderRadius="4px"
      bg="brand.500"
      color="white"
      align="center"
      justify="center"
      flexShrink={0}
    >
      <Text fontSize="lg" fontWeight="800" lineHeight="1">
        {initial}
      </Text>
    </Flex>
  );
}
