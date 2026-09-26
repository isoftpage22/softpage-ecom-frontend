const CHANNELS = ["dine_in", "takeaway", "delivery", "menu", "storefront"];

function roundPaise(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function gstOnAmount(amount, percent, taxInclusive) {
  const total = Number(amount) || 0;
  const rate = Number(percent) || 0;
  if (!(total > 0) || !(rate > 0)) return 0;
  if (taxInclusive) return roundPaise(total - total / (1 + rate / 100));
  return roundPaise((total * rate) / 100);
}

export function splitGst(tax) {
  const rounded = roundPaise(tax);
  const cgst = roundPaise(rounded / 2);
  return { cgst, sgst: roundPaise(rounded - cgst) };
}

export function parseExtraCharges(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const name = String(row.name || "").trim();
      const amount = roundPaise(Math.max(0, Number(row.amount) || 0));
      if (!name || !(amount > 0)) return null;
      const channels = Array.isArray(row.channels)
        ? row.channels.filter((channel) => CHANNELS.includes(String(channel)))
        : [];
      return {
        id: String(row.id || name),
        name,
        amount,
        gstPercent: Number(row.gstPercent) || 18,
        channels,
      };
    })
    .filter(Boolean);
}

export function extraChargesForCart(charges, { origin, orderType, shippingCost } = {}) {
  const originKey = String(origin || "menu").toLowerCase();
  let type = String(orderType || "").toLowerCase();
  if ((!type || type === "online") && Number(shippingCost) > 0) type = "delivery";
  return (charges || []).filter((charge) => {
    const channels = charge.channels || [];
    if (originKey === "menu" && channels.includes("menu")) return true;
    if (originKey === "storefront" && channels.includes("storefront")) return true;
    if (type === "dine_in" && channels.includes("dine_in")) return true;
    if (type === "takeaway" && channels.includes("takeaway")) return true;
    if (type === "delivery" && channels.includes("delivery")) return true;
    return false;
  });
}

export function applyExtraChargesForCart(rawCharges, ctx) {
  const parsed = parseExtraCharges(rawCharges);
  const matching = extraChargesForCart(parsed, ctx);
  return matching.map((charge) => ({
    id: charge.id,
    name: charge.name,
    amount: charge.amount,
    gstPercent: charge.gstPercent,
    tax: gstOnAmount(charge.amount, charge.gstPercent, ctx?.taxInclusive === true),
  }));
}

export function taxesAndOtherChargesBreakdown({
  itemTax = 0,
  gstPercent = 18,
  deliveryGstPercent,
  applied = [],
  shippingTax = 0,
  taxInclusive = false,
} = {}) {
  const lines = [];
  const item = roundPaise(itemTax);
  if (item > 0) {
    if (Number(gstPercent) === 5) {
      const { cgst, sgst } = splitGst(item);
      lines.push({ label: "CGST (2.5%) on items", amount: cgst });
      lines.push({ label: "SGST (2.5%) on items", amount: sgst });
    } else {
      lines.push({ label: `GST (${gstPercent}%) on items`, amount: item });
    }
  }
  for (const charge of applied || []) {
    const tax = roundPaise(Number(charge.tax) || 0);
    const amount = roundPaise(Number(charge.amount) + (taxInclusive ? 0 : tax));
    if (!(amount > 0)) continue;
    lines.push({
      label: tax > 0 ? `${charge.name} (tax inclusive)` : charge.name,
      amount,
    });
  }
  const shipTax = roundPaise(shippingTax);
  if (shipTax > 0) {
    const deliveryRate = Number.isFinite(Number(deliveryGstPercent)) ? Number(deliveryGstPercent) : gstPercent;
    lines.push({ label: `GST (${deliveryRate}%) on delivery`, amount: shipTax });
  }
  return lines.filter((line) => line.amount > 0);
}
