import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery, gql } from "@/lib/api/graphqlBaseQuery";
import type {
  CheckoutResult,
  CheckoutSessionStatus,
  Order,
  OrderTracking,
  OrdersResponse,
  ShippingRate,
} from "@/types/order.types";

const MENU_ORDER_LIST_FIELDS = gql`
  fragment MenuOrderList on OrderTypeGql {
    id
    orderNumber
    status
    paymentStatus
    paymentMethod
    channel
    orderType
    total
    currency
    createdAt
    lines {
      id
      quantity
      item {
        id
        name
      }
    }
  }
`;

const MENU_CHECKOUT_ORDER_FIELDS = gql`
  fragment MenuCheckoutOrder on OrderTypeGql {
    id
    orderNumber
    status
    paymentStatus
    paymentMethod
    channel
    orderType
    total
    currency
    createdAt
  }
`;

const MENU_ORDER_DETAIL_FIELDS = gql`
  fragment MenuOrderDetail on OrderTypeGql {
    id
    orderNumber
    status
    paymentStatus
    paymentMethod
    channel
    orderType
    providerOrderId
    lines {
      id
      itemId
      variantId
      quantity
      unitPrice
      totalPrice
      tax
      addons {
        groupId
        groupName
        optionId
        optionName
        price
      }
      comboSelections {
        groupId
        groupName
        componentId
        componentItemId
        componentName
        variantId
        quantity
        priceDelta
      }
      notes
      item {
        id
        name
        slug
        media {
          id
          url
        }
      }
      variant {
        id
        name
        imageUrl
      }
    }
    subtotal
    tax
    discount
    shippingCost
    serviceCharge
    tip
    total
    currency
    couponCode
    customerName
    customerPhone
    customerEmail
    shippingAddress {
      firstName
      lastName
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      phone
      latitude
      longitude
    }
    notes
    confirmedAt
    completedAt
    cancelledAt
    cancellationReason
    createdAt
    updatedAt
  }
`;

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: graphqlBaseQuery,
  tagTypes: ["Cart", "ShippingRates", "Order", "Orders"],
  endpoints: (builder) => ({
    getShippingRates: builder.query<
      ShippingRate[],
      { businessId: number; postalCode?: string; country?: string; orderValue?: number; isCod?: boolean }
    >({
      query: ({ businessId, postalCode, country, orderValue, isCod }) => ({
        document: gql`
          query GetShippingRates(
            $businessId: Int!
            $postalCode: String
            $country: String
            $orderValue: Float
            $isCod: Boolean
          ) {
            ecommerceShippingRates(
              businessId: $businessId
              postalCode: $postalCode
              country: $country
              orderValue: $orderValue
              isCod: $isCod
            ) {
              id
              name
              description
              price
              estimatedDeliveryDays
              currency
            }
          }
        `,
        variables: { businessId, postalCode, country, orderValue, isCod },
      }),
      transformResponse: (response: { ecommerceShippingRates: ShippingRate[] }) =>
        response.ecommerceShippingRates,
      providesTags: ["ShippingRates"],
    }),

    initiateCheckout: builder.mutation<
      CheckoutResult,
      {
        businessId: number;
        cartId: string;
        shippingRateId?: string;
        paymentMethod?: string;
        notes?: string;
        tableId?: string;
        channel?: string;
        orderType?: string;
        reservationId?: string;
        resourceId?: string;
        tip?: number;
        payLater?: boolean;
        returnOrigin?: string;
      }
    >({
      query: ({
        businessId,
        cartId,
        shippingRateId,
        paymentMethod,
        notes,
        tableId,
        channel,
        orderType,
        reservationId,
        resourceId,
        tip,
        payLater,
        returnOrigin,
      }) => ({
        document: gql`
          ${MENU_CHECKOUT_ORDER_FIELDS}
          mutation InitiateCheckout($businessId: Int!, $input: InitiateCheckoutInput!) {
            ecommerceInitiateCheckout(businessId: $businessId, input: $input) {
              order {
                ...MenuCheckoutOrder
              }
              checkoutSessionId
              amount
              currency
              razorpayOrderId
              razorpayKeyId
              paymentRequired
              paymentPageUrl
            }
          }
        `,
        variables: {
          businessId,
          input: {
            cartId,
            shippingRateId,
            paymentMethod,
            notes,
            tableId,
            channel,
            orderType,
            reservationId,
            resourceId,
            tip,
            payLater,
            returnOrigin,
          },
        },
      }),
      transformResponse: (response: { ecommerceInitiateCheckout: CheckoutResult }) =>
        response.ecommerceInitiateCheckout,
      invalidatesTags: ["Cart", "Orders"],
    }),

    resumePayment: builder.mutation<
      CheckoutResult,
      { businessId: number; orderId: string; returnOrigin?: string }
    >({
      query: ({ businessId, orderId, returnOrigin }) => ({
        document: gql`
          ${MENU_ORDER_DETAIL_FIELDS}
          mutation ResumeMenuPayment($businessId: Int!, $input: ResumePaymentInput!) {
            ecommerceResumePayment(businessId: $businessId, input: $input) {
              order {
                ...MenuOrderDetail
              }
              checkoutSessionId
              amount
              currency
              razorpayOrderId
              razorpayKeyId
              paymentRequired
              paymentPageUrl
            }
          }
        `,
        variables: {
          businessId,
          input: { orderId, returnOrigin },
        },
      }),
      transformResponse: (response: { ecommerceResumePayment: CheckoutResult }) =>
        response.ecommerceResumePayment,
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Orders",
      ],
    }),

    confirmPayment: builder.mutation<
      Order,
      {
        businessId: number;
        orderId?: string;
        checkoutSessionId?: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      }
    >({
      query: ({
        businessId,
        orderId,
        checkoutSessionId,
        razorpayPaymentId,
        razorpaySignature,
      }) => ({
        document: gql`
          ${MENU_CHECKOUT_ORDER_FIELDS}
          mutation ConfirmMenuPayment($businessId: Int!, $input: ConfirmPaymentInput!) {
            ecommerceConfirmPayment(businessId: $businessId, input: $input) {
              ...MenuCheckoutOrder
            }
          }
        `,
        variables: {
          businessId,
          input: {
            ...(orderId ? { orderId } : {}),
            ...(checkoutSessionId ? { checkoutSessionId } : {}),
            razorpayPaymentId,
            razorpaySignature,
          },
        },
      }),
      transformResponse: (response: { ecommerceConfirmPayment: Order }) =>
        response.ecommerceConfirmPayment,
      invalidatesTags: (result, error, { orderId }) => [
        ...(orderId ? [{ type: "Order" as const, id: orderId }] : []),
        "Orders",
        "Cart",
      ],
    }),

    checkoutSessionStatus: builder.query<
      CheckoutSessionStatus,
      { businessId: number; checkoutSessionId: string }
    >({
      query: ({ businessId, checkoutSessionId }) => ({
        document: gql`
          query MenuCheckoutSessionStatus($businessId: Int!, $checkoutSessionId: String!) {
            ecommerceCheckoutSessionStatus(
              businessId: $businessId
              checkoutSessionId: $checkoutSessionId
            ) {
              id
              status
              orderId
              orderNumber
              amount
              currency
              expiresAt
            }
          }
        `,
        variables: { businessId, checkoutSessionId },
      }),
      transformResponse: (response: {
        ecommerceCheckoutSessionStatus: CheckoutSessionStatus;
      }) => response.ecommerceCheckoutSessionStatus,
    }),

    abandonCheckoutSession: builder.mutation<
      boolean,
      { businessId: number; checkoutSessionId: string; reason?: string }
    >({
      query: ({ businessId, checkoutSessionId, reason }) => ({
        document: gql`
          mutation MenuAbandonCheckoutSession(
            $businessId: Int!
            $checkoutSessionId: String!
            $reason: String
          ) {
            ecommerceAbandonCheckoutSession(
              businessId: $businessId
              checkoutSessionId: $checkoutSessionId
              reason: $reason
            )
          }
        `,
        variables: { businessId, checkoutSessionId, reason },
      }),
      transformResponse: (response: {
        ecommerceAbandonCheckoutSession: boolean;
      }) => response.ecommerceAbandonCheckoutSession,
      invalidatesTags: ["Cart"],
    }),

    getOrders: builder.query<
      OrdersResponse,
      { businessId: number; page?: number; pageSize?: number }
    >({
      query: ({ businessId, page = 1, pageSize = 20 }) => ({
        document: gql`
          ${MENU_ORDER_LIST_FIELDS}
          query GetMenuOrders($businessId: Int!, $pagination: PaginationInput) {
            ecommerceOrders(businessId: $businessId, pagination: $pagination) {
              orders {
                ...MenuOrderList
              }
              total
              page
              pageSize
            }
          }
        `,
        variables: { businessId, pagination: { page, pageSize } },
      }),
      transformResponse: (response: { ecommerceOrders: OrdersResponse }) =>
        response.ecommerceOrders,
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query<Order | null, { businessId: number; orderId: string }>({
      query: ({ businessId, orderId }) => ({
        document: gql`
          ${MENU_ORDER_DETAIL_FIELDS}
          query GetMenuOrder($businessId: Int!, $orderId: String!) {
            ecommerceOrder(businessId: $businessId, orderId: $orderId) {
              ...MenuOrderDetail
            }
          }
        `,
        variables: { businessId, orderId },
      }),
      transformResponse: (response: { ecommerceOrder: Order | null }) => response.ecommerceOrder,
      providesTags: (result, error, { orderId }) => [{ type: "Order", id: orderId }],
    }),

    getOrderTracking: builder.query<OrderTracking | null, { businessId: number; orderId: string }>({
      query: ({ businessId, orderId }) => ({
        document: gql`
          query GetMenuOrderTracking($businessId: Int!, $orderId: String!) {
            ecommerceOrderTracking(businessId: $businessId, orderId: $orderId) {
              orderId
              status
              provider
              trackingId
              trackingUrl
              labelUrl
              driverName
              driverPhone
              vehicleNumber
              live
              current { lat lng label source at }
              pickup { lat lng label source at }
              drop { lat lng label source at }
              scans { at activity location lat lng }
              message
            }
          }
        `,
        variables: { businessId, orderId },
      }),
      transformResponse: (response: { ecommerceOrderTracking: OrderTracking | null }) =>
        response.ecommerceOrderTracking,
      providesTags: (result, error, { orderId }) => [{ type: "Order", id: orderId }],
    }),
  }),
});

export const {
  useLazyGetShippingRatesQuery,
  useInitiateCheckoutMutation,
  useResumePaymentMutation,
  useConfirmPaymentMutation,
  useCheckoutSessionStatusQuery,
  useAbandonCheckoutSessionMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
} = ordersApi;
