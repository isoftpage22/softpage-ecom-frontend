"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Text } from "@chakra-ui/react";
import { startRouteLoading } from "@/src/Store/action/loader";

/**
 * Legacy restaurant table QR entry (`/t/:token`). CRM still prints
 * https://{host}/t/{qrToken}; the menu app resolves scans at `/qr/:token`.
 */
export default function LegacyTableRedirectPage() {
  const params = useParams<{ tableToken: string }>();
  const router = useRouter();
  const tableToken = params.tableToken;

  useEffect(() => {
    if (tableToken) {
      startRouteLoading();
      router.replace(`/qr/${encodeURIComponent(tableToken)}`);
    }
  }, [tableToken, router]);

  return (
    <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
      <Text>Loading menu…</Text>
    </Box>
  );
}
