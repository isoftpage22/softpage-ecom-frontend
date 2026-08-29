"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Hosted payments cancel URL is /checkout?payment=cancelled */
export default function CheckoutReturnPage() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const cancelled = search.get("payment") === "cancelled";
    router.replace(cancelled ? "/cart?payment=cancelled" : "/cart");
  }, [router, search]);

  return null;
}
