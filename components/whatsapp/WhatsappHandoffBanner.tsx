"use client";

import { usePathname } from "next/navigation";
import { useWhatsappHandoff } from "@/lib/whatsapp/useWhatsappHandoff";
import { backToWhatsappUrl, formatWaNumber } from "@/lib/whatsapp/handoff";

const ORDER_PAGES = ["/orders/", "/order-status/", "/payment-return"];

/** Slim bar shown while a visit that started in the store's WhatsApp chat is active. */
export function WhatsappHandoffBanner() {
  const handoff = useWhatsappHandoff();
  const pathname = usePathname() || "";
  if (!handoff) return null;

  const onOrderPage = ORDER_PAGES.some((prefix) => pathname.startsWith(prefix));
  const back = backToWhatsappUrl(handoff);
  const number = formatWaNumber(handoff.waId);

  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px 12px",
        padding: "8px 16px",
        background: "#E7F8EE",
        color: "#075E54",
        fontSize: 12,
        lineHeight: 1.4,
        textAlign: "center",
      }}
    >
      <span>
        {onOrderPage
          ? `Order updates will come on WhatsApp (${number}).`
          : `Ordering from WhatsApp. Updates will be sent to ${number}.`}
      </span>
      {back && (
        <a href={back} style={{ fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>
          Back to WhatsApp
        </a>
      )}
    </div>
  );
}
