"use client";

import { useEffect, useState } from "react";
import { LoaderOverlay } from "@/src/Components/Loader/LoaderOverlay";

/** Render children only after mount so Chakra v2 does not hydrate against SSR HTML. */
export function ClientOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <>{fallback ?? <LoaderOverlay />}</>;
  return <>{children}</>;
}
