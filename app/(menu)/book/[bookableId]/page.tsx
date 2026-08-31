"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { BookingFlow } from "@/components/reservations/BookingFlow";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { ClientOnly } from "@/components/ClientOnly";

function BookableBookingBody() {
  const params = useParams();
  const bookableId =
    typeof params?.bookableId === "string" ? params.bookableId : "";
  if (!bookableId) return null;
  return (
    <>
      <TopBarWithBackButton headerText="Reserve" />
      <BookingFlow bookableId={bookableId} />
    </>
  );
}

export default function BookableBookingPage() {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <BookableBookingBody />
      </Suspense>
    </ClientOnly>
  );
}
