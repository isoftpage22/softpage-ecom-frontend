"use client";

import ShoppingCart from "@/src/View/ShoppingCart";
import { ClientOnly } from "@/components/ClientOnly";

export default function CartPage() {
  return (
    <ClientOnly>
      <ShoppingCart />
    </ClientOnly>
  );
}
