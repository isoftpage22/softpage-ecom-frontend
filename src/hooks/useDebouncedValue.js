"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after `delayMs` of no changes. Empty strings flush
 * immediately so clearing search restores the full list without a wait.
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (String(value).trim() === "") {
      setDebounced(value);
      return undefined;
    }
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
