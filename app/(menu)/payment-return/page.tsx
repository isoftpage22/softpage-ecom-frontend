"use client";

import PaymentReturn from "@/src/View/PaymentReturn/PaymentReturn";
import { ClientOnly } from "@/components/ClientOnly";

export default function PaymentReturnPage() {
  return (
    <ClientOnly>
      <PaymentReturn />
    </ClientOnly>
  );
}
