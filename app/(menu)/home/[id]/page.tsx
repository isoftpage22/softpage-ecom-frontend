"use client";

import Home from "@/src/View/Home";
import { ClientOnly } from "@/components/ClientOnly";

export default function HomeByIdPage() {
  return (
    <ClientOnly>
      <Home />
    </ClientOnly>
  );
}
