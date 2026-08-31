"use client";

import { Box, Text } from "@chakra-ui/react";
import { useStoreConfig } from "@/lib/tenant/TenantContext";
import { todayHoursLabel } from "@/lib/store/operationalHours";

export function StoreClosedScreen() {
  const config = useStoreConfig();
  const hours = todayHoursLabel(config.businessHours, config.timezone);
  return (
    <Box minH="100vh" bg="black" color="white" px="24px" py="80px" textAlign="center">
      <Text fontSize="24px" fontWeight="700" mb="12px">
        {config.name || "Store"}
      </Text>
      <Text fontSize="22px" fontWeight="700" mb="8px">
        We are closed
      </Text>
      <Text color="#d1d1d1">
        This store is not accepting orders right now. Please check back later.
      </Text>
      {hours && (
        <Text color="#a3a3a3" mt="12px" fontSize="14px">
          {hours}
        </Text>
      )}
    </Box>
  );
}
