/**
 * National 10-digit Indian mobile from autofill/paste (`+91 85889 13958`).
 */
export function normalizeIndianMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length <= 10 ? digits : digits.slice(-10);
}

/** Chrome contact chips often dump "Name +91 85889 13958" into one field. */
export function splitContactAutofill(raw) {
  const text = String(raw || "").trim();
  if (!text) return { name: "", phone: "" };
  const digitCount = text.replace(/\D/g, "").length;
  const phone = digitCount >= 10 ? normalizeIndianMobile(text) : "";
  const name = text
    .replace(/\+?\d[\d\s\-()]{8,}\d/g, "")
    .replace(/[,;|/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { name, phone };
}
