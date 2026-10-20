import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { refreshStorefrontSession } from "@/lib/api/graphqlBaseQuery";

type RestQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

// Sign-in steps answer 401 for a wrong OTP or password. That is not an expired session.
const SIGN_IN_STEPS = /\/storefront\/auth\/(signup-info|send-otp|login|register|refresh|logout)\b/;

/**
 * Retries a signed-in REST call once after renewing an expired access token,
 * the same way GraphQL calls do.
 */
export function withSessionRefresh(baseQuery: RestQuery): RestQuery {
  return async (args, api, extraOptions) => {
    const hadToken = typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));
    let result = await baseQuery(args, api, extraOptions);
    const url = typeof args === "string" ? args : args.url;
    if (result.error?.status === 401 && hadToken && !SIGN_IN_STEPS.test(url)) {
      const token = await refreshStorefrontSession();
      if (token) result = await baseQuery(args, api, extraOptions);
    }
    return result;
  };
}
