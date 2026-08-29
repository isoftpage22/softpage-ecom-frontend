"use client";

import OrderDetail from "@/src/View/Orders/OrderDetail";
import { ClientOnly } from "@/components/ClientOnly";

export default function OrderDetailPage() {
  return (
    <ClientOnly>
      <OrderDetail />
    </ClientOnly>
  );
}
