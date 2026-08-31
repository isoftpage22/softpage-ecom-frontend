"use client";

import { useEffect, useState } from "react";
import { useStoreConfig } from "@/lib/tenant/TenantContext";
import { isStoreAcceptingOrders } from "@/lib/store/operationalHours";
import { StoreClosedScreen } from "@/components/StoreClosedScreen";

export function StoreAvailabilityGate({ children }: { children: React.ReactNode }) {
  const config = useStoreConfig();
  const [accepting, setAccepting] = useState(() =>
    isStoreAcceptingOrders({
      isStoreOpen: config.isStoreOpen,
      businessHours: config.businessHours,
      timezone: config.timezone,
    }),
  );

  useEffect(() => {
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
  }, [config.businessHours, config.isStoreOpen, config.timezone]);

  if (!accepting) return <StoreClosedScreen />;
  return <>{children}</>;
}
