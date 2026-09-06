"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import Home from "@/src/View/Home";
import { ClientOnly } from "@/components/ClientOnly";
import {
  useResolveFloorTableQuery,
  useResolveQrLinkQuery,
} from "@/store/api/qrApi";
import { setTableSession } from "@/lib/restaurant/table-session";
import { useTenant, setQrTenantOverride } from "@/lib/tenant/TenantContext";
import { Link } from "@/src/lib/nav";

export default function QrMenuPage() {
  return (
    <ClientOnly
      fallback={
        <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
          <Text>Loading menu…</Text>
        </Box>
      }
    >
      <QrMenuPageInner />
    </ClientOnly>
  );
}

function QrMenuPageInner() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";
  const tenant = useTenant();
  const { data, isLoading, error } = useResolveQrLinkQuery(
    { token },
    { skip: !token },
  );
  const { data: floor, isLoading: floorLoading } = useResolveFloorTableQuery(
    { token },
    { skip: !token },
  );
  const [sessionReady, setSessionReady] = useState(false);

  const hostResolved = Boolean(tenant?.businessId);
  const resolvedBusinessId = data?.businessId ?? floor?.businessId;
  const wrongStore = Boolean(
    resolvedBusinessId &&
      hostResolved &&
      tenant &&
      resolvedBusinessId !== tenant.businessId,
  );

  const shouldShowHome = useMemo(() => {
    if (!sessionReady) return false;
    if (data?.linkType === "CUSTOM") return false;
    if (wrongStore) return false;
    return Boolean(data || floor?.table);
  }, [data, floor, sessionReady, wrongStore]);

  useEffect(() => {
    if (data?.linkType === "CUSTOM" && data.targetUrl) {
      window.location.href = data.targetUrl;
      return;
    }
    if (wrongStore) return;
    if (!data && !floor?.table) return;

    const tableId =
      data?.tableId ??
      (data?.metadata?.tableId as string | undefined) ??
      floor?.table.id;
    const paymentTiming =
      data?.paymentTiming ?? floor?.paymentTiming ?? "on_close";
    const businessId = data?.businessId ?? floor?.businessId;
    if (!businessId) return;

    setQrTenantOverride({
      businessId,
      businessAppId: data?.businessAppId ?? businessId,
    });
    setTableSession({
      tableId,
      qrToken: token,
      orderType: "dine_in",
      channel: "qr_table",
      businessId,
      businessAppId: data?.businessAppId ?? businessId,
      tableNumber:
        (data?.metadata?.tableNumber as string | undefined) ??
        floor?.table.number,
      tableName:
        (data?.metadata?.tableName as string | undefined) ??
        data?.resource?.name ??
        data?.label ??
        floor?.table.name ??
        (floor?.table.number ? `Table ${floor.table.number}` : undefined),
      section: (data?.metadata?.section as string) ?? undefined,
      qrLinkId: data?.id,
      resourceId: data?.resource?.id,
      resourceType: data?.resource?.type,
      label: data?.label ?? floor?.table.name ?? floor?.table.number,
      matchedReservationId: data?.matchedReservation?.reservationId,
      depositAmount: data?.matchedReservation?.depositAmount,
      paymentTiming,
    });
    setSessionReady(true);
  }, [data, floor, token, wrongStore]);

  if (isLoading || (error && floorLoading)) {
    return (
      <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Loading menu…</Text>
      </Box>
    );
  }

  if (!data && !floor?.table) {
    return (
      <Box px="24px" py="64px" textAlign="center">
        <Text fontSize="22px" fontWeight="700" mb="8px">
          QR code not found
        </Text>
        <Text color="#787676" mb="24px">
          This QR code may be invalid or no longer active.
        </Text>
        <Link to="/" href="/">
          <Button variant="solidFull">Go to menu</Button>
        </Link>
      </Box>
    );
  }

  if (wrongStore) {
    return (
      <Box px="24px" py="64px" textAlign="center">
        <Text fontSize="22px" fontWeight="700" mb="8px">
          Wrong store
        </Text>
        <Text color="#787676">
          This QR code belongs to a different store. Open it from that store&apos;s
          domain.
        </Text>
      </Box>
    );
  }

  if (!shouldShowHome) {
    return (
      <Box px="24px" py="64px" textAlign="center">
        <Text>Redirecting…</Text>
      </Box>
    );
  }

  return <Home />;
}
