"use client";

import ProfileView from "@/src/View/Profile/Profile";
import { ClientOnly } from "@/components/ClientOnly";

export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProfileView />
    </ClientOnly>
  );
}
