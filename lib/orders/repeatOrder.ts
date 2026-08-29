import type { Order, OrderLine } from "@/types/order.types";

export type RepeatCartPayload = {
  id: string;
  productName: string;
  unitPrice: number;
  addQuantity: number;
  variantId: string | null;
  variantName: string;
  addons: NonNullable<OrderLine["addons"]>;
  comboSelections: NonNullable<OrderLine["comboSelections"]>;
  customizationLabel: string;
};

export function lineDisplayName(line: OrderLine): string {
  return line.item?.name || "Item";
}

export function orderLineToCartPayload(line: OrderLine): RepeatCartPayload | null {
  const itemId = line.itemId || line.item?.id;
  const name = line.item?.name;
  if (!itemId || !name) return null;
  const addons = line.addons || [];
  const comboSelections = line.comboSelections || [];
  const variantName = line.variant?.name || "";
  return {
    id: String(itemId),
    productName: name,
    unitPrice: Number(line.unitPrice) || 0,
    addQuantity: Math.max(1, Number(line.quantity) || 1),
    variantId: line.variantId || line.variant?.id || null,
    variantName,
    addons,
    comboSelections,
    customizationLabel: [
      variantName,
      ...addons.map((addon) => addon.optionName),
      ...comboSelections.map((combo) => combo.componentName),
    ]
      .filter(Boolean)
      .join(", "),
  };
}

export function repeatPayloadsFromOrder(order: Order): {
  payloads: RepeatCartPayload[];
  skipped: number;
} {
  const payloads: RepeatCartPayload[] = [];
  let skipped = 0;
  for (const line of order.lines || []) {
    const payload = orderLineToCartPayload(line);
    if (payload) payloads.push(payload);
    else skipped += 1;
  }
  return { payloads, skipped };
}
