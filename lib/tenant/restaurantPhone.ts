type StoreContact = {
  phone?: string | null;
  supportPhone?: string | null;
  phones?: {
    primary?: string | null;
    secondary?: string | null;
    support?: string | null;
  };
};

export function restaurantPhoneFromConfig(contact?: StoreContact | null): string | null {
  const raw =
    contact?.supportPhone ||
    contact?.phones?.support ||
    contact?.phone ||
    contact?.phones?.primary;
  const trimmed = String(raw || "").trim();
  return trimmed || null;
}

export function restaurantTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits || phone}`;
}
