import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiOrigin } from "@/lib/api/origin";

const API_ORIGIN = apiOrigin();
const BASE_URL = `${API_ORIGIN}/api/v1`;

/** Backend wraps REST responses as `{ success, statusCode, data, ... }`. */
type Envelope<T> = { data: T } | T;
function unwrap<T>(res: Envelope<T>): T {
  if (res && typeof res === "object" && "data" in (res as object)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export type QrLinkType = "RESOURCE" | "CATALOG" | "CUSTOM";

export interface ResolvedQrResource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  bookableId: string;
}

export interface MatchedReservation {
  reservationId: string;
  depositAmount: number;
  customerName: string | null;
}

export interface ResolvedQrLink {
  id: string;
  qrToken: string;
  businessId: number;
  businessAppId: number | null;
  label: string;
  description: string | null;
  linkType: QrLinkType;
  targetUrl: string | null;
  catalogConfig: Record<string, unknown> | null;
  defaultStorefrontPath: string | null;
  /** Resolved restaurant floor table id (RESOURCE links), else null. */
  tableId: string | null;
  /** Restaurant dine-in payment timing: pay now vs settle at table close. */
  paymentTiming: "upfront" | "on_close";
  metadata: Record<string, unknown> | null;
  resource: ResolvedQrResource | null;
  matchedReservation: MatchedReservation | null;
}

export const qrApi = createApi({
  reducerPath: "qrApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["QrLink"],
  endpoints: (builder) => ({
    resolveQrLink: builder.query<ResolvedQrLink, { token: string }>({
      query: ({ token }) => `/public/qr/${encodeURIComponent(token)}`,
      transformResponse: (r: Envelope<ResolvedQrLink>) => unwrap(r),
      providesTags: ["QrLink"],
    }),
  }),
});

export const { useResolveQrLinkQuery } = qrApi;
