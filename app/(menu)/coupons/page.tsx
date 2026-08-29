"use client";

import ListOfCoupons from "@/src/View/ListOfCoupons/ListOfCoupons";
import { ClientOnly } from "@/components/ClientOnly";

export default function CouponsPage() {
  return (
    <ClientOnly>
      <ListOfCoupons />
    </ClientOnly>
  );
}
