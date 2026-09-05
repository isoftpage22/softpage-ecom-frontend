"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { shouldStartRouteLoading, startRouteLoading } from "@/src/Store/action/loader";

/** Hosted payments cancel URL is /checkout?payment=cancelled */
export default function CheckoutReturnPage() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const cancelled = search.get("payment") === "cancelled";
    const dest = cancelled ? "/cart?payment=cancelled" : "/cart";
    if (shouldStartRouteLoading(dest)) startRouteLoading();
    router.replace(dest);
  }, [router, search]);

  return null;
}
