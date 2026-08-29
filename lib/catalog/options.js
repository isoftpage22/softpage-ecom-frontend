function trackedQuantity(value) {
  if (value == null || value === "") return null
  const qty = Number(value)
  return Number.isFinite(qty) ? qty : null
}

function allowsSaleWhenEmpty(product, variant) {
  const tracking =
    variant?.trackQuantity === true ||
    (variant?.trackQuantity !== true && product?.trackQuantity === true)
  if (!tracking) return true
  if (variant?.allowBackorder === true || product?.allowBackorder === true) return true
  return false
}

export function isVariantOutOfStock(variant, product) {
  if (!variant) return false
  if (allowsSaleWhenEmpty(product, variant)) return false
  const qty = trackedQuantity(variant?.availableQuantity)
  return qty != null && qty <= 0
}

export function isProductOutOfStock(product) {
  if (!product) return false
  const status = String(product.status || "").toLowerCase()
  if (status === "out_of_stock" || status === "inactive") return true
  if (allowsSaleWhenEmpty(product)) return false

  const variants = Array.isArray(product.variants) ? product.variants : []
  if (variants.length > 0) {
    return variants.every((variant) => isVariantOutOfStock(variant, product))
  }

  const qty = trackedQuantity(product.availableQuantity)
  return qty != null && qty <= 0
}

export function productHasOptions(product) {
  return (
    (product?.variants?.length ?? 0) > 0 ||
    (product?.addonGroups?.length ?? 0) > 0 ||
    (product?.comboGroups?.length ?? 0) > 0
  )
}

export function defaultAddonSelections(addonGroups = []) {
  const selected = []
  for (const group of addonGroups) {
    const max = Number(group.maxSelections)
    const cap = Number.isFinite(max) && max > 0 ? max : 99
    const defaults = (group.options || []).filter((option) => option.isDefault)
    for (const option of defaults.slice(0, cap)) {
      selected.push({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionName: option.name,
        price: Number(option.price) || 0,
      })
    }
  }
  return selected
}

export function catalogUnitPrice(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  if (variants.length > 0) {
    const prices = variants
      .map((variant) => Number(variant.price))
      .filter((price) => Number.isFinite(price) && price > 0)
    if (prices.length > 0) return Math.min(...prices)
  }
  return Number(product?.price || product?.productCost || 0) || 0
}

export function customizationLabel({ variantName, addons = [], comboSelections = [] } = {}) {
  return [
    variantName,
    ...addons.map((addon) => addon.optionName),
    ...comboSelections.map((combo) => combo.componentName),
  ]
    .filter(Boolean)
    .join(", ")
}

export function cartLineKey(line = {}) {
  const productId = line.product_id || line.id || ""
  const addons = (line.addons || [])
    .map((addon) => addon.optionId)
    .sort()
    .join(",")
  const combos = (line.comboSelections || [])
    .map((combo) => combo.componentId)
    .sort()
    .join(",")
  return `${productId}|${line.variantId || ""}|${addons}|${combos}`
}

export function qtyForProduct(products, productId) {
  return (products || [])
    .filter((line) => String(line.product_id) === String(productId))
    .reduce((sum, line) => sum + Number(line.quantity || 0), 0)
}

export function lastCartLineForProduct(products, productId) {
  const matches = (products || []).filter(
    (line) => String(line.product_id) === String(productId)
  )
  return matches[matches.length - 1] || null
}

export function variantUnitPrice(product, variant) {
  const base = catalogUnitPrice(product)
  if (!variant) return base
  const price = Number(variant.price)
  return Number.isFinite(price) && price > 0 ? price : base
}

export function cartPayloadFromSelection(product, selection) {
  return {
    ...product,
    variantId: selection.variant?.id ?? null,
    variantName: selection.variant?.name ?? "",
    addons: selection.addons || [],
    comboSelections: selection.comboSelections || [],
    unitPrice: selection.unitPrice,
    addQuantity: selection.quantity || 1,
    customizationLabel: customizationLabel({
      variantName: selection.variant?.name,
      addons: selection.addons,
      comboSelections: selection.comboSelections,
    }),
  }
}

export function cartPayloadFromLine(product, line) {
  return {
    ...product,
    variantId: line.variantId ?? null,
    variantName: line.variantName ?? "",
    addons: line.addons || [],
    comboSelections: line.comboSelections || [],
    unitPrice: Number(line.unit_price),
    lineKey: line.lineKey,
    addQuantity: 1,
    customizationLabel: line.customizationLabel,
  }
}

export function filterVegOnlyCatalog(productList, vegOnly) {
  if (!vegOnly || !productList) return productList
  const categories = (productList.categories || [])
    .map((category) => ({
      ...category,
      products: (category.products || []).filter((product) => product.isVeg),
    }))
    .filter((category) => category.products.length > 0)
  return { ...productList, categories }
}
