"use client";

import { useLayoutEffect, useRef } from "react";
import { consumeListingRestore, peekListingRestore } from "@/lib/menu/listingRestore";

/**
 * After listing filters/search have been rehydrated, jump back to the saved
 * scroll offset. Re-applies briefly so Next's default scroll-to-top cannot
 * win, then drops the snapshot so a later visit starts at top.
 */
export function useMenuListingRestore(ready) {
  const appliedY = useRef(null);

  useLayoutEffect(() => {
    if (!ready) return;
    const snap = peekListingRestore();
    if (!snap) return;

    const y = snap.y || 0;
    appliedY.current = y;
    if (typeof window.history?.scrollRestoration === "string") {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, y);

    const apply = () => {
      if (appliedY.current == null) return;
      window.scrollTo(0, appliedY.current);
    };

    const raf = window.requestAnimationFrame(apply);
    const timers = [0, 50, 150, 400].map((ms) =>
      window.setTimeout(() => {
        apply();
        if (ms >= 400) consumeListingRestore();
      }, ms),
    );

    return () => {
      window.cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [ready]);
}
