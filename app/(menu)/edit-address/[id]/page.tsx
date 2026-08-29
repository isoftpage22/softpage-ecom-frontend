"use client";

import CreateAddress from "@/src/View/Address/CreateAddress";
import { ClientOnly } from "@/components/ClientOnly";

export default function EditAddressPage() {
  return (
    <ClientOnly>
      <CreateAddress />
    </ClientOnly>
  );
}
