"use client";

import AddressListing from "@/src/View/Address/AddressListing";
import { ClientOnly } from "@/components/ClientOnly";

export default function AddressesPage() {
  return (
    <ClientOnly>
      <AddressListing />
    </ClientOnly>
  );
}
