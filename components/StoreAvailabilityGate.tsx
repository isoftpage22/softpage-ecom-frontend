"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStoreConfig } from "@/lib/tenant/TenantContext";
import { isStoreAcceptingOrders } from "@/lib/store/operationalHours";
import { StoreClosedScreen } from "@/components/StoreClosedScreen";

export function StoreAvailabilityGate({ children }: { children: React.ReactNode }) {
  const config = useStoreConfig();
  const params = useSearchParams();
  const previewing = params.has("sp_preview") || params.has("sp_edit");
  const [accepting, setAccepting] = useState(() =>
    previewing ||
    isStoreAcceptingOrders({
      isStoreOpen: config.isStoreOpen,
      businessHours: config.businessHours,
      timezone: config.timezone,
    }),
  );

  useEffect(() => {
    if (previewing) {
      setAccepting(true);
      return;
    }
    const tick = () =>
      setAccepting(
        isStoreAcceptingOrders({
          isStoreOpen: config.isStoreOpen,
          businessHours: config.businessHours,
          timezone: config.timezone,
        }),
      );
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [config.businessHours, config.isStoreOpen, config.timezone, previewing]);

  if (previewing || accepting) return <>{children}</>;
  return <StoreClosedScreen />;
}
