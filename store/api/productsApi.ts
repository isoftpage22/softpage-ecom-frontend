import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery, gql } from "@/lib/api/graphqlBaseQuery";
import type { Product, ProductsResponse, Category } from "@/types/product.types";

const PRODUCT_FIELDS = gql`
  fragment ProductFields on ItemTypeGql {
    id
    name
    description
    shortName
    slug
    price
    compareAtPrice
    status
    categoryId
    availableQuantity
    isVeg
    tags
    trackQuantity
    allowBackorder
    media {
      id
      url
      altText
      type
      position
    }
    variants {
      id
      name
      sku
      price
      compareAtPrice
      barcode
      availableQuantity
      trackQuantity
      allowBackorder
      imageUrl
    }
    addonGroups {
      id
      name
      isRequired
      minSelections
      maxSelections
      options {
        id
        name
        price
        isDefault
        position
      }
    }
    isCombo
    comboGroups {
      id
      name
      isRequired
      minSelections
      maxSelections
      position
      components {
        id
        componentItemId
        componentVariantId
        name
        priceDelta
        quantity
        isDefault
        position
        imageUrl
      }
    }
  }
`;

/** Production API may not have isVeg / mapped variant names yet. */
const SLIM_PRODUCT_FIELDS = gql`
  fragment SlimProductFields on ItemTypeGql {
    id
    name
    description
    shortName
    slug
    price
    compareAtPrice
    status
    categoryId
    availableQuantity
    media {
      id
      url
      altText
      type
      position
    }
  }
`;

function catalogQueryVariables(businessId: number, filters: ProductFilters = {}) {
  return {
    businessId,
    filter: {
      search: filters.search,
      categoryId: filters.categoryId,
      categoryIds: filters.categoryIds,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      collectionId: filters.collectionId,
      collectionSlug: filters.collectionSlug,
      tags: filters.tags,
      productIds: filters.productIds,
      createdSince: filters.createdSince,
    },
    pagination: {
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
    },
  };
}

export interface ProductFilters {
  categoryId?: number;
  categoryIds?: number[];
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
  collectionId?: number;
  collectionSlug?: string;
  tags?: string[];
  productIds?: string[];
  /** ISO date string – products created at or after this timestamp. */
  createdSince?: string;
}

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: graphqlBaseQuery,
  tagTypes: ["Product", "Products", "Categories", "Collections"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, { businessId: number; filters?: ProductFilters }>({
      async queryFn({ businessId, filters = {} }, _api, _extraOptions, baseQuery) {
        const variables = catalogQueryVariables(businessId, filters);
        const full = await baseQuery({
          document: gql`
            ${PRODUCT_FIELDS}
            query GetProducts($businessId: Int!, $filter: CatalogFilterInput, $pagination: PaginationInput) {
              ecommerceProducts(businessId: $businessId, filter: $filter, pagination: $pagination) {
                items {
                  ...ProductFields
                }
                total
                page
                pageSize
                totalPages
              }
            }
          `,
          variables,
        });
        const fullData = (full.data as { ecommerceProducts?: ProductsResponse } | undefined)?.ecommerceProducts;
        if (!full.error && fullData) {
          return { data: fullData };
        }
        const slim = await baseQuery({
          document: gql`
            ${SLIM_PRODUCT_FIELDS}
            query GetProductsSlim($businessId: Int!, $filter: CatalogFilterInput, $pagination: PaginationInput) {
              ecommerceProducts(businessId: $businessId, filter: $filter, pagination: $pagination) {
                items {
                  ...SlimProductFields
                }
                total
                page
                pageSize
                totalPages
              }
            }
          `,
          variables,
        });
        if (slim.error) {
          return { error: slim.error };
        }
        const slimData = (slim.data as { ecommerceProducts?: ProductsResponse } | undefined)?.ecommerceProducts;
        if (!slimData) {
          return {
            error: {
              status: 400,
              message: "Catalog returned no products",
            },
          };
        }
        return { data: slimData };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Products" as const },
            ]
          : [{ type: "Products" as const }],
    }),

    getProductById: builder.query<Product, { businessId: number; id: string }>({
      query: ({ businessId, id }) => ({
        document: gql`
          ${PRODUCT_FIELDS}
          query GetProduct($businessId: Int!, $id: String) {
            ecommerceProduct(businessId: $businessId, id: $id) {
              ...ProductFields
            }
          }
        `,
        variables: { businessId, id },
      }),
      transformResponse: (response: { ecommerceProduct: Product }) =>
        response.ecommerceProduct,
      providesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),

    getProductBySlug: builder.query<Product, { businessId: number; slug: string }>({
      query: ({ businessId, slug }) => ({
        document: gql`
          ${PRODUCT_FIELDS}
          query GetProductBySlug($businessId: Int!, $slug: String) {
            ecommerceProduct(businessId: $businessId, slug: $slug) {
              ...ProductFields
            }
          }
        `,
        variables: { businessId, slug },
      }),
      transformResponse: (response: { ecommerceProduct: Product }) =>
        response.ecommerceProduct,
      providesTags: (result) => (result ? [{ type: "Product", id: result.id }] : []),
    }),

    getCategories: builder.query<Category[], { businessId: number; parentId?: number }>({
      query: ({ businessId, parentId }) => ({
        document: gql`
          query GetCategories($businessId: Int!, $parentId: Int) {
            ecommerceCategories(businessId: $businessId, parentId: $parentId) {
              id
              name
              slug
              description
              image
              bannerImage
              sortOrder
              isActive
              isFeatured
            }
          }
        `,
        variables: { businessId, parentId },
      }),
      transformResponse: (response: { ecommerceCategories: Category[] }) =>
        response.ecommerceCategories,
      providesTags: ["Categories"],
    }),

    getBrands: builder.query<string[], { businessId: number }>({
      query: ({ businessId }) => ({
        document: gql`
          query GetBrands($businessId: Int!) {
            ecommerceBrands(businessId: $businessId)
          }
        `,
        variables: { businessId },
      }),
      transformResponse: (response: { ecommerceBrands: string[] }) =>
        response.ecommerceBrands,
    }),

    getBestSellers: builder.query<
      Product[],
      { businessId: number; limit?: number; sinceDays?: number }
    >({
      query: ({ businessId, limit = 12, sinceDays }) => ({
        document: gql`
          ${PRODUCT_FIELDS}
          query GetBestSellers($businessId: Int!, $limit: Int, $sinceDays: Int) {
            ecommerceBestSellers(
              businessId: $businessId
              limit: $limit
              sinceDays: $sinceDays
            ) {
              ...ProductFields
            }
          }
        `,
        variables: { businessId, limit, sinceDays },
      }),
      transformResponse: (response: { ecommerceBestSellers: Product[] }) =>
        response.ecommerceBestSellers,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Products" as const },
            ]
          : [{ type: "Products" as const }],
    }),

    getCollections: builder.query<any[], { businessId: number }>({
      query: ({ businessId }) => ({
        document: gql`
          query GetCollections($businessId: Int!) {
            ecommerceCollections(businessId: $businessId) {
              id
              name
              description
              slug
              imageUrl
              isActive
            }
          }
        `,
        variables: { businessId },
      }),
      transformResponse: (response: { ecommerceCollections: any[] }) =>
        response.ecommerceCollections,
      providesTags: ["Collections"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetCollectionsQuery,
  useGetBestSellersQuery,
} = productsApi;
