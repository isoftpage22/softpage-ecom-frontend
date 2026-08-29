import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { getGuestSessionId } from "@/lib/cart/session";
import { extractErrorMessages } from "@/lib/api/userFacingError";
import { apiOrigin } from "@/lib/api/origin";

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: Error | null, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
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

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/storefront/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, businessId: storefrontBusinessId() }),
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const payload = json?.data && typeof json.data === "object" ? json.data : json;
    const tokens = payload?.tokens || payload;
    if (tokens?.accessToken) {
      localStorage.setItem("accessToken", tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
      }
      return tokens.accessToken as string;
    }
    return null;
  } catch {
    return null;
  }
}

export const graphqlBaseQuery: BaseQueryFn<
  GraphQLRequest,
  unknown,
  { status: number; data?: unknown; message: string }
> = async ({ document, variables }, api, extraOptions) => {
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
    if (isRefreshing) {
      return new Promise((resolve) => {
        failedQueue.push({
          resolve: async (newToken) => {
            const retryResult = await executeQuery(newToken);
            resolve(retryResult.error ? { error: retryResult.error } : { data: retryResult.data });
          },
          reject: (error) => {
            resolve({
              error: {
                status: 401,
                message: "Authentication failed",
              },
            });
          },
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      if (newToken) {
        processQueue(null, newToken);
        result = await executeQuery(newToken);
      } else {
        const error = new Error("Token refresh failed");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        api.dispatch({ type: "auth/clearAuth" });
        processQueue(error, null);
        return {
          error: {
            status: 401,
            message: "Authentication required",
          },
        };
      }
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      api.dispatch({ type: "auth/clearAuth" });
      processQueue(error as Error, null);
      return {
        error: {
          status: 401,
          message: "Authentication failed",
        },
      };
    } finally {
      isRefreshing = false;
    }
  }

  return result.error ? { error: result.error } : { data: result.data };
};

export function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
}

export default graphqlBaseQuery;
