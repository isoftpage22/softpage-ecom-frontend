type ErrorRecord = Record<string, unknown>;

function asRecord(value: unknown): ErrorRecord | null {
  return value && typeof value === "object" ? (value as ErrorRecord) : null;
}

function messageFromGraphqlError(entry: unknown): string {
  if (typeof entry === "string" && entry.trim()) return entry.trim();
  const rec = asRecord(entry);
  if (!rec) return "";

  const original = asRecord(rec.extensions)?.originalError;
  const originalRec = asRecord(original);
  const nested = originalRec?.message ?? (typeof original === "string" ? original : null);
  if (typeof nested === "string" && nested.trim()) return nested.trim();
  if (Array.isArray(nested)) {
    return nested.filter((part) => typeof part === "string" && part.trim()).join(". ");
  }
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message.trim();
  return "";
}

function messagesFromData(data: unknown): string[] {
  if (data == null) return [];
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return messagesFromData(JSON.parse(trimmed));
      } catch {
        return looksLikeGraphqlDump(trimmed) ? [] : [trimmed];
      }
    }
    return looksLikeGraphqlDump(trimmed) ? [] : [trimmed];
  }
  if (Array.isArray(data)) {
    return data.map(messageFromGraphqlError).filter(Boolean);
  }
  const rec = asRecord(data);
  if (!rec) return [];
  if (Array.isArray(rec.errors)) return rec.errors.map(messageFromGraphqlError).filter(Boolean);
  if (typeof rec.message === "string" && rec.message.trim()) return [rec.message.trim()];
  if (Array.isArray(rec.message)) {
    return rec.message.filter((part): part is string => typeof part === "string" && !!part.trim());
  }
  if (typeof rec.error === "string" && rec.error.trim() && rec.error !== "Bad Request") {
    return [rec.error.trim()];
  }
  return [];
}

function looksLikeGraphqlDump(text: string): boolean {
  return /"locations"\s*:/.test(text) && /"extensions"\s*:/.test(text);
}

export function extractErrorMessages(err: unknown): string[] {
  if (err == null) return [];
  if (typeof err === "string") return messagesFromData(err);
  if (err instanceof Error) {
    const extra = err as Error & { data?: unknown };
    const fromData = messagesFromData(extra.data);
    if (fromData.length) return fromData;
    if (err.message) return messagesFromData(err.message);
    return [];
  }
  const rec = asRecord(err);
  if (!rec) return [];
  if (Array.isArray(rec.errors)) {
    const fromErrors = rec.errors.map(messageFromGraphqlError).filter(Boolean);
    if (fromErrors.length) return fromErrors;
  }
  const fromData = messagesFromData(rec.data);
  if (fromData.length) return fromData;
  if (typeof rec.message === "string") return messagesFromData(rec.message);
  if (typeof rec.error === "string" && rec.error !== "Bad Request") return [rec.error];
  return [];
}

export function rtkErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const messages = extractErrorMessages(err);
  return messages.length ? messages.join(". ") : fallback;
}

export type UserFacingError = {
  title: string;
  message: string;
  itemNames: string[];
  kind: "stock" | "unavailable" | "wallet" | "generic";
};

const WALLET_CUSTOMER_MESSAGE =
  "This store cannot accept the order right now. Please try again later.";

export function isWalletInsufficientError(err: unknown, joined = ""): boolean {
  const haystack = `${joined} ${JSON.stringify(err ?? "")}`.toUpperCase();
  return (
    haystack.includes("WALLET_INSUFFICIENT") ||
    haystack.includes("CANNOT ACCEPT THE ORDER RIGHT NOW")
  );
}

export function itemNamesFromMessages(messages: string[]): string[] {
  const names = new Set<string>();
  for (const msg of messages) {
    const named = [...msg.matchAll(/(?:Insufficient stock for|Item)\s+["“']([^"”']+)["”']/gi)];
    named.forEach((match) => {
      if (match[1]) names.add(match[1].trim());
    });
  }
  return [...names];
}

export function namesMatch(a?: string | null, b?: string | null): boolean {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

export function lineMatchesItemNames(
  line: { productName?: string; product?: { productName?: string } } | null,
  itemNames: string[] = [],
): boolean {
  if (!itemNames.length || !line) return false;
  const label = line.productName || line.product?.productName || "";
  return itemNames.some((name) => namesMatch(label, name));
}

export function formatCheckoutError(
  err: unknown,
  fallback = "Could not place order",
): UserFacingError {
  const messages = extractErrorMessages(err);
  const joined = messages.join(". ") || fallback;
  if (isWalletInsufficientError(err, joined)) {
    return {
      title: "Store unavailable",
      message: WALLET_CUSTOMER_MESSAGE,
      itemNames: [],
      kind: "wallet",
    };
  }
  const itemNames = itemNamesFromMessages(messages);
  const stockish = /insufficient stock/i.test(joined);
  const unavailable = /no longer available/i.test(joined);

  if (stockish && itemNames.length === 1) {
    return {
      title: "Out of stock",
      message: `${itemNames[0]} doesn’t have enough stock to complete this order. Remove it from your cart to continue.`,
      itemNames,
      kind: "stock",
    };
  }
  if (stockish && itemNames.length > 1) {
    return {
      title: "Out of stock",
      message: `${itemNames.join(", ")} don’t have enough stock. Remove them from your cart to continue.`,
      itemNames,
      kind: "stock",
    };
  }
  if (stockish) {
    return {
      title: "Out of stock",
      message: "One or more items don’t have enough stock. Remove them or try a smaller quantity.",
      itemNames,
      kind: "stock",
    };
  }
  if (unavailable && itemNames.length) {
    const many = itemNames.length > 1;
    return {
      title: "No longer available",
      message: `${itemNames.join(", ")} ${many ? "are" : "is"} no longer available. Remove ${many ? "them" : "it"} from your cart to continue.`,
      itemNames,
      kind: "unavailable",
    };
  }

  return {
    title: "Couldn’t place order",
    message: joined,
    itemNames,
    kind: "generic",
  };
}

export function catalogStockError(itemNames: string[]): UserFacingError | null {
  const names = (itemNames || []).filter(Boolean);
  if (!names.length) return null;
  if (names.length === 1) {
    return {
      title: "Out of stock",
      message: `${names[0]} is out of stock. Remove it from your cart to continue.`,
      itemNames: names,
      kind: "stock",
    };
  }
  return {
    title: "Out of stock",
    message: `${names.join(", ")} are out of stock. Remove them from your cart to continue.`,
    itemNames: names,
    kind: "stock",
  };
}
