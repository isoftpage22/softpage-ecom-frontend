"use client";

import OrderStatus from "@/src/View/OrderStatus";
import { ClientOnly } from "@/components/ClientOnly";

export default function OrderStatusByIdPage() {
  return (
    <ClientOnly>
      <OrderStatus />
    </ClientOnly>
  );
}
