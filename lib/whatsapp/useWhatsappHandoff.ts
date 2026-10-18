"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { HANDOFF_STORAGE_KEY, captureHandoffFromUrl, readHandoff, type WhatsappHandoff } from "./handoff";

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Whichever page the chat link opened, take `?wa=` off the URL once and tell every reader.
  if (captureHandoffFromUrl()) listeners.forEach((notify) => notify());
  const onStorage = (event: StorageEvent) => {
    if (event.key === HANDOFF_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function snapshot(): string | null {
  try {
    return window.localStorage.getItem(HANDOFF_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The visit's WhatsApp chat handoff for this store, or null. */
export function useWhatsappHandoff(): WhatsappHandoff | null {
  const businessId = useBusinessId();
  const token = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => (token ? readHandoff(businessId) : null), [token, businessId]);
}
