"use client";

import OrderStatus from "@/src/View/OrderStatus";
import { ClientOnly } from "@/components/ClientOnly";

export default function OrderStatusPage() {
  return (
    <ClientOnly>
      <OrderStatus />
    </ClientOnly>
  );
}
