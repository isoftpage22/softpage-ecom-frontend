import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { getGuestSessionId } from "@/lib/cart/session";
import { extractErrorMessages } from "@/lib/api/userFacingError";
import { apiOrigin } from "@/lib/api/origin";
import { notifyStorefrontAuthChanged } from "@/lib/auth/events";

const API_BASE_URL = apiOrigin();
// GraphQL is served under the backend's global API prefix (useGlobalPrefix:
// true + setGlobalPrefix('api/v1')), so the endpoint is /api/v1/graphql.
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/api/v1/graphql`;

export interface GraphQLRequest {
  document: string;
  variables?: Record<string, unknown>;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, unknown>;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

let refreshGeneration = 0;
let inflightRefresh: Promise<string | null> | null = null;

/** Drop an in-flight token refresh so logout cannot be undone by a late write. */
export function cancelStorefrontTokenRefresh(): void {
  refreshGeneration += 1;
  inflightRefresh = null;
}

/**
 * The server said the session is over: drop the tokens and tell the UI.
 * The saved name and number stay so the account drawer can offer
 * "sign in again" instead of looking signed in.
 */
function endStorefrontSession(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  notifyStorefrontAuthChanged();
}

function storefrontBusinessId(): number {
  try {
    const raw = localStorage.getItem("STORE_INFO");
    if (raw) {
      const parsed = JSON.parse(raw) as { businessId?: number; industryId?: number };
      const n = Number(parsed.businessId || parsed.industryId);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    /* ignore */
  }
  return parseInt(process.env.NEXT_PUBLIC_BUSINESS_ID || "1", 10);
}

/**
 * Get a new access token. Every request that hits an expired token shares one
 * refresh, so the single-use refresh token is only spent once.
 * Returns null when there is no session to renew or the server can't be reached.
 */
export function refreshStorefrontSession(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!inflightRefresh) {
    const run = refreshAccessToken();
    inflightRefresh = run;
    run.finally(() => {
      if (inflightRefresh === run) inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

async function refreshAccessToken(): Promise<string | null> {
  const generation = refreshGeneration;
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    if (localStorage.getItem("accessToken")) endStorefrontSession();
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/storefront/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, businessId: storefrontBusinessId() }),
    });
  } catch {
    // Offline or the API is down. Keep the session and try again next time.
    return null;
  }
  if (generation !== refreshGeneration) return null;

  if (!response.ok) {
    // Another tab may have renewed the session while this request was out.
    const latest = localStorage.getItem("refreshToken");
    if (latest && latest !== refreshToken) return localStorage.getItem("accessToken");
    if (response.status >= 500) return null;
    endStorefrontSession();
    return null;
  }

  try {
    const json = await response.json();
    const payload = json?.data && typeof json.data === "object" ? json.data : json;
    const tokens = payload?.tokens || payload;
    if (generation !== refreshGeneration) return null;
    if (tokens?.accessToken) {
      localStorage.setItem("accessToken", tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
      }
      return tokens.accessToken as string;
    }
  } catch {
    /* unreadable reply: treat like a failed refresh but keep the session */
  }
  return null;
}

export const graphqlBaseQuery: BaseQueryFn<
  GraphQLRequest,
  unknown,
  { status: number; data?: unknown; message: string }
> = async ({ document, variables }, _api, extraOptions) => {
  const executeQuery = async (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Always send a guest session id (generating one if needed) so guest carts
    // can be created and re-read. The backend uses this header when no
    // authenticated customer / explicit sessionId arg is present.
    const sessionId = getGuestSessionId();
    if (sessionId) {
      headers["x-session-id"] = sessionId;
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: document,
        variables,
      }),
      credentials: "include",
    });

    const json: GraphQLResponse = await response.json();

    if (json.errors && json.errors.length > 0) {
      const authError = json.errors.find(
        (e) =>
          e.extensions?.code === "UNAUTHENTICATED" ||
          e.message.toLowerCase().includes("unauthorized")
      );

      if (authError) {
        return { authError: true, json };
      }

      return {
        error: {
          status: 400,
          data: json.errors,
          message:
            extractErrorMessages({ data: json.errors }).join(". ") ||
            json.errors.map((e) => e.message).join(", "),
        },
      };
    }

    return { data: json.data };
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  let result = await executeQuery(token);

  if (result.authError) {
    const newToken = await refreshStorefrontSession();
    if (!newToken) {
      return {
        error: {
          status: 401,
          message: "Authentication required",
        },
      };
    }
    result = await executeQuery(newToken);
    if (result.authError) {
      return {
        error: {
          status: 401,
          message: "Authentication required",
        },
      };
    }
  }

  return result.error ? { error: result.error } : { data: result.data };
};

export function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
}

export default graphqlBaseQuery;
