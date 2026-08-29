"use client";

import { useEffect } from "react";
import { useBusinessId, useBusinessAppId } from "@/lib/tenant/TenantContext";
import { STORE_INFO } from "@/src/utils/constants";

/** Persist tenant ids so checkout and catalog stay aligned with QR override. */
export function PersistStoreInfo() {
  const businessId = useBusinessId();
  const businessAppId = useBusinessAppId();

  useEffect(() => {
    if (!businessId) return;
    const payload = {
      industryId: businessId,
      ecommerceId: businessAppId ?? businessId,
      businessId,
      businessAppId: businessAppId ?? businessId,
    };
    try {
      localStorage.setItem(STORE_INFO, JSON.stringify(payload));
    } catch {
      // ignore quota / private-mode failures
    }
  }, [businessId, businessAppId]);

  return null;
}
