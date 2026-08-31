import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiOrigin } from "@/lib/api/origin";
import type {
  SignupInfoResult,
  AuthResult,
  StorefrontMe,
  StorefrontTokens,
  CustomerAddress,
  AddressInput,
} from "@/types/storefront-auth.types";

const API_ORIGIN = apiOrigin();
const BASE_URL = `${API_ORIGIN}/api/v1`;

type Envelope<T> = { data: T } | T;
function unwrap<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const storefrontAuthApi = createApi({
  reducerPath: "storefrontAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Me", "Addresses"],
  endpoints: (builder) => ({
    signupInfo: builder.mutation<
      SignupInfoResult,
      { identifier: string; countryCode?: string; businessId: number; fullName?: string }
    >({
      query: (body) => ({ url: "/storefront/auth/signup-info", method: "POST", body }),
      transformResponse: unwrap,
    }),

    sendOtp: builder.mutation<
      { success: boolean; otpSent: boolean },
      { identifier: string; countryCode?: string; businessId: number }
    >({
      query: (body) => ({ url: "/storefront/auth/send-otp", method: "POST", body }),
      transformResponse: unwrap,
    }),

    login: builder.mutation<
      AuthResult,
      {
        identifier: string;
        businessId: number;
        countryCode?: string;
        otp?: string;
        password?: string;
        fullName?: string;
      }
    >({
      query: (body) => ({ url: "/storefront/auth/login", method: "POST", body }),
      transformResponse: unwrap,
    }),

    register: builder.mutation<
      AuthResult,
      {
        identifier: string;
        businessId: number;
        fullName: string;
        countryCode?: string;
        otp?: string;
        preAuthToken?: string;
        password?: string;
      }
    >({
      query: (body) => ({ url: "/storefront/auth/register", method: "POST", body }),
      transformResponse: unwrap,
    }),

    refresh: builder.mutation<
      { tokens: StorefrontTokens },
      { refreshToken: string; businessId: number }
    >({
      query: (body) => ({ url: "/storefront/auth/refresh", method: "POST", body }),
      transformResponse: unwrap,
    }),

    getMe: builder.query<StorefrontMe, void>({
      query: () => ({ url: "/storefront/auth/me", method: "GET" }),
      transformResponse: unwrap,
      providesTags: ["Me"],
    }),

    listAddresses: builder.query<CustomerAddress[], void>({
      query: () => ({ url: "/storefront/auth/addresses", method: "GET" }),
      transformResponse: unwrap,
      providesTags: ["Addresses"],
    }),

    createAddress: builder.mutation<CustomerAddress, AddressInput>({
      query: (body) => ({ url: "/storefront/auth/addresses", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Addresses"],
    }),

    updateAddress: builder.mutation<CustomerAddress, { id: number; data: AddressInput }>({
      query: ({ id, data }) => ({
        url: `/storefront/auth/addresses/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Addresses"],
    }),

    deleteAddress: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/storefront/auth/addresses/${id}`,
        method: "DELETE",
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Addresses"],
    }),

    logout: builder.mutation<{ success: boolean }, { refreshToken: string }>({
      query: (body) => ({ url: "/storefront/auth/logout", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Me", "Addresses"],
    }),
  }),
});

export const {
  useSignupInfoMutation,
  useSendOtpMutation,
  useLoginMutation: useStorefrontLoginMutation,
  useRegisterMutation: useStorefrontRegisterMutation,
  useListAddressesQuery,
  useLazyListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = storefrontAuthApi;
