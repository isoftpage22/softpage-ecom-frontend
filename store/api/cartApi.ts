import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery, gql } from "@/lib/api/graphqlBaseQuery";
import type { Cart, AddToCartInput, Address } from "@/types/cart.types";

const CART_FIELDS = gql`
  fragment MenuCartFields on CartTypeGql {
    id
    status
    items {
      id
      itemId
      variantId
      quantity
      unitPrice
      totalPrice
      tax
      notes
    }
    itemCount
    subtotal
    tax
    discount
    shippingCost
    selectedShippingRateId
    total
    currency
    appliedCoupon {
      code
      name
      type
      discountAmount
    }
    notes
  }
`;

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: graphqlBaseQuery,
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query<
      Cart | null,
      { businessId: number; businessAppId: number; sessionId?: string }
    >({
      query: ({ businessId, businessAppId, sessionId }) => ({
        document: gql`
          ${CART_FIELDS}
          query GetCart($businessId: Int!, $businessAppId: Int!, $sessionId: String) {
            ecommerceCart(businessId: $businessId, businessAppId: $businessAppId, sessionId: $sessionId) {
              ...MenuCartFields
            }
          }
        `,
        variables: { businessId, businessAppId, sessionId },
      }),
      transformResponse: (response: { ecommerceCart: Cart | null }) => response.ecommerceCart,
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<
      Cart,
      { businessId: number; businessAppId: number; sessionId?: string; input: AddToCartInput }
    >({
      query: ({ businessId, businessAppId, sessionId, input }) => ({
        document: gql`
          ${CART_FIELDS}
          mutation AddToCart($businessId: Int!, $businessAppId: Int!, $sessionId: String, $input: AddToCartInput!) {
            ecommerceAddToCart(businessId: $businessId, businessAppId: $businessAppId, sessionId: $sessionId, input: $input) {
              ...MenuCartFields
            }
          }
        `,
        variables: { businessId, businessAppId, sessionId, input },
      }),
      transformResponse: (response: { ecommerceAddToCart: Cart }) => response.ecommerceAddToCart,
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<Cart, { businessId: number; cartId: string }>({
      query: ({ businessId, cartId }) => ({
        document: gql`
          ${CART_FIELDS}
          mutation ClearCart($businessId: Int!, $cartId: String!) {
            ecommerceClearCart(businessId: $businessId, cartId: $cartId) {
              ...MenuCartFields
            }
          }
        `,
        variables: { businessId, cartId },
      }),
      transformResponse: (response: { ecommerceClearCart: Cart }) => response.ecommerceClearCart,
      invalidatesTags: ["Cart"],
    }),

    setShippingAddress: builder.mutation<
      Cart,
      { businessId: number; cartId: string; shippingAddress: Address; sameAsBilling?: boolean }
    >({
      query: ({ businessId, cartId, shippingAddress, sameAsBilling = true }) => ({
        document: gql`
          ${CART_FIELDS}
          mutation SetShippingAddress($businessId: Int!, $cartId: String!, $input: SetShippingAddressInput!) {
            ecommerceSetShippingAddress(businessId: $businessId, cartId: $cartId, input: $input) {
              ...MenuCartFields
            }
          }
        `,
        variables: {
          businessId,
          cartId,
          input: { shippingAddress, sameAsBilling },
        },
      }),
      transformResponse: (response: { ecommerceSetShippingAddress: Cart }) =>
        response.ecommerceSetShippingAddress,
      invalidatesTags: ["Cart"],
    }),

    setShippingRate: builder.mutation<
      Cart,
      { businessId: number; cartId: string; shippingRateId: string }
    >({
      query: ({ businessId, cartId, shippingRateId }) => ({
        document: gql`
          ${CART_FIELDS}
          mutation SetShippingRate($businessId: Int!, $cartId: String!, $shippingRateId: String!) {
            ecommerceSetShippingRate(businessId: $businessId, cartId: $cartId, shippingRateId: $shippingRateId) {
              ...MenuCartFields
            }
          }
        `,
        variables: { businessId, cartId, shippingRateId },
      }),
      transformResponse: (response: { ecommerceSetShippingRate: Cart }) =>
        response.ecommerceSetShippingRate,
      invalidatesTags: ["Cart"],
    }),

    replaceCartLines: builder.mutation<
      Cart,
      {
        businessId: number;
        businessAppId: number;
        sessionId?: string;
        input: { lines: AddToCartInput[]; shippingAddress?: Address };
      }
    >({
      query: ({ businessId, businessAppId, sessionId, input }) => ({
        document: gql`
          ${CART_FIELDS}
          mutation ReplaceCartLines(
            $businessId: Int!
            $businessAppId: Int!
            $sessionId: String
            $input: ReplaceCartLinesInput!
          ) {
            ecommerceReplaceCartLines(
              businessId: $businessId
              businessAppId: $businessAppId
              sessionId: $sessionId
              input: $input
            ) {
              ...MenuCartFields
            }
          }
        `,
        variables: { businessId, businessAppId, sessionId, input },
      }),
      transformResponse: (response: { ecommerceReplaceCartLines: Cart }) =>
        response.ecommerceReplaceCartLines,
    }),

    applyCoupon: builder.mutation<Cart, { businessId: number; cartId: string; couponCode: string }>({
      query: ({ businessId, cartId, couponCode }) => ({
        document: gql`
          ${CART_FIELDS}
          mutation ApplyCoupon($businessId: Int!, $cartId: String!, $input: ApplyCouponInput!) {
            ecommerceApplyCoupon(businessId: $businessId, cartId: $cartId, input: $input) {
              ...MenuCartFields
            }
          }
        `,
        variables: { businessId, cartId, input: { couponCode } },
      }),
      transformResponse: (response: { ecommerceApplyCoupon: Cart }) => response.ecommerceApplyCoupon,
      invalidatesTags: ["Cart"],
    }),

    removeCoupon: builder.mutation<Cart, { businessId: number; cartId: string }>({
      query: ({ businessId, cartId }) => ({
        document: gql`
          ${CART_FIELDS}
          mutation RemoveCoupon($businessId: Int!, $cartId: String!) {
            ecommerceRemoveCoupon(businessId: $businessId, cartId: $cartId) {
              ...MenuCartFields
            }
          }
        `,
        variables: { businessId, cartId },
      }),
      transformResponse: (response: { ecommerceRemoveCoupon: Cart }) => response.ecommerceRemoveCoupon,
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useLazyGetCartQuery,
  useAddToCartMutation,
  useClearCartMutation,
  useSetShippingAddressMutation,
  useSetShippingRateMutation,
  useReplaceCartLinesMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} = cartApi;
