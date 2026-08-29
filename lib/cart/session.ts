"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "sessionId";

/**
 * Returns a stable guest session id, generating and persisting one on first
 * use. The backend cart requires either a logged-in customer or a session id
 * (`x-session-id` header / `sessionId` arg); without this, guest add-to-cart
 * fails with "Either customerId or sessionId is required". Returns `undefined`
 * on the server so it stays SSR-safe.
 */
export function getGuestSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/**
 * React hook wrapper around {@link getGuestSessionId}. Resolves the id after
 * mount (so server and first client render agree on `undefined`, avoiding
 * hydration mismatches) and then triggers dependent queries to refetch with a
 * stable id.
 */
export function useGuestSessionId(): string | undefined {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  useEffect(() => {
    setSessionId(getGuestSessionId());
  }, []);
  return sessionId;
}
