import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery, gql } from "@/lib/api/graphqlBaseQuery";

export type CouponBannerPlacement = "home" | "cart" | "checkout" | "all";

export interface AvailableCoupon {
  code: string;
  name: string;
  description?: string | null;
  type: string;
  value: number;
  minimumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  validUntil?: string | null;
  isApplicable: boolean;
  ineligibilityReason?: string | null;
}

export interface CouponBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  placement: string;
  couponCode?: string | null;
  sortOrder: number;
}

export const promotionsApi = createApi({
  reducerPath: "promotionsApi",
  baseQuery: graphqlBaseQuery,
  tagTypes: ["AvailableCoupons", "CouponBanners"],
  endpoints: (builder) => ({
    getAvailableCoupons: builder.query<
      AvailableCoupon[],
      { businessId: number; cartId?: string }
    >({
      query: ({ businessId, cartId }) => ({
        document: gql`
          query AvailableCoupons($businessId: Int!, $cartId: String) {
            ecommerceAvailableCoupons(businessId: $businessId, cartId: $cartId) {
              code
              name
              description
              type
              value
              minimumOrderAmount
              maximumDiscountAmount
              validUntil
              isApplicable
              ineligibilityReason
            }
          }
        `,
        variables: { businessId, cartId },
      }),
      transformResponse: (response: { ecommerceAvailableCoupons: AvailableCoupon[] }) =>
        response.ecommerceAvailableCoupons || [],
      providesTags: ["AvailableCoupons"],
    }),
    getCouponBanners: builder.query<
      CouponBanner[],
      { businessId: number; placement?: CouponBannerPlacement }
    >({
      query: ({ businessId, placement }) => ({
        document: gql`
          query CouponBanners($businessId: Int!, $placement: CouponBannerPlacement) {
            ecommerceCouponBanners(businessId: $businessId, placement: $placement) {
              id
              title
              subtitle
              imageUrl
              ctaLabel
              ctaHref
              placement
              couponCode
              sortOrder
            }
          }
        `,
        variables: { businessId, placement },
      }),
      transformResponse: (response: { ecommerceCouponBanners: CouponBanner[] }) =>
        response.ecommerceCouponBanners || [],
      providesTags: ["CouponBanners"],
    }),
  }),
});

export const { useGetAvailableCouponsQuery, useGetCouponBannersQuery } = promotionsApi;
