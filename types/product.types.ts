export interface ProductMedia {
  id: string;
  url: string;
  altText?: string;
  type: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  barcode?: string;
  availableQuantity?: number;
  trackQuantity?: boolean;
  allowBackorder?: boolean;
  imageUrl?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
  position: number;
}

export interface AddonGroup {
  id: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  options: AddonOption[];
}

export interface ComboComponent {
  id: string;
  componentItemId: string;
  componentVariantId?: string | null;
  name: string;
  priceDelta: number;
  quantity: number;
  isDefault: boolean;
  position: number;
  imageUrl?: string | null;
}

export interface ComboGroup {
  id: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  position: number;
  components: ComboComponent[];
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  shortName?: string;
  slug?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  status: "draft" | "active" | "inactive" | "out_of_stock";
  taxClass: number;
  taxInclusive: boolean;
  categoryId?: number;
  categoryEntity?: Category;
  media: ProductMedia[];
  variants: ProductVariant[];
  addonGroups: AddonGroup[];
  isCombo?: boolean;
  comboGroups?: ComboGroup[];
  isVeg?: boolean | null;
  tags?: string[];
  availableQuantity?: number;
  trackQuantity?: boolean;
  allowBackorder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  filters: {
    categoryId?: number;
    categoryIds?: number[];
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: string;
  };
}
