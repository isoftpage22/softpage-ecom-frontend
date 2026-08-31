"use client";

import BookingsList from "@/src/View/Bookings/BookingsList";
import { ClientOnly } from "@/components/ClientOnly";

export default function BookingsPage() {
  return (
    <ClientOnly>
      <BookingsList />
    </ClientOnly>
  );
}
