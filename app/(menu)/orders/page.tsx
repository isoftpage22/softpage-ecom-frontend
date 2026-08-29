"use client";

import OrdersList from "@/src/View/Orders/OrdersList";
import { ClientOnly } from "@/components/ClientOnly";

export default function OrdersPage() {
  return (
    <ClientOnly>
      <OrdersList />
    </ClientOnly>
  );
}
