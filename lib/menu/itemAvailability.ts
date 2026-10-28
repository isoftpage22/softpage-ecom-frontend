"use client";

import { useEffect, useState } from "react";
import { useStoreConfig } from "@/lib/tenant/TenantContext";
import { ALWAYS_AVAILABLE, resolveItemAvailability, type AvailabilityFields, type ItemAvailability } from "./itemAvailabilityCore";

export { resolveItemAvailability } from "./itemAvailabilityCore";
export type { AvailabilityFields, ItemAvailability, ServingWindow } from "./itemAvailabilityCore";

/** Live availability for a dish; re-checked every 30 seconds while the menu is open. */
export function useItemAvailability(item: AvailabilityFields | null | undefined): ItemAvailability {
  const { timezone, businessHours } = useStoreConfig();
  const zone = timezone || businessHours?.timezone || null;
  const timed = Array.isArray(item?.servingWindows);
  // First render uses the server's answer so cached HTML hydrates cleanly; the tick then takes over.
  const [state, setState] = useState<ItemAvailability>(() =>
    timed && item?.availableNow === false
      ? { availableNow: false, label: item.availabilityLabel ?? null, hidden: item.availabilityHidden === true }
      : ALWAYS_AVAILABLE,
  );

  const windows = item?.servingWindows ?? null;
  const hideOutside = item?.availabilityHidden === true;
  useEffect(() => {
    const tick = () => {
      const next = resolveItemAvailability({ servingWindows: windows, availabilityHidden: hideOutside }, zone);
      setState((prev) =>
        prev.availableNow === next.availableNow && prev.label === next.label && prev.hidden === next.hidden ? prev : next,
      );
    };
    tick();
    if (!windows) return;
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [windows, hideOutside, zone]);

  return state;
}
