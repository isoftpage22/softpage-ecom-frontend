"use client";

import { Box, Text } from "@chakra-ui/react";
import { useStoreConfig } from "@/lib/tenant/TenantContext";

export function StoreClosedScreen() {
  const config = useStoreConfig();
  return (
    <Box minH="100vh" bg="black" color="white" px="24px" py="80px" textAlign="center">
      <Text fontSize="24px" fontWeight="700" mb="12px">
        {config.name || "Store"}
      </Text>
      <Text color="#d1d1d1">
        This menu is closed right now. Please check back later.
      </Text>
    </Box>
  );
}
