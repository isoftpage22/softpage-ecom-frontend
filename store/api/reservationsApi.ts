import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiOrigin } from "@/lib/api/origin";

const API_ORIGIN = apiOrigin();
const BASE_URL = `${API_ORIGIN}/api/v1`;

/** Backend wraps REST responses as `{ success, statusCode, data, ... }`. */
function unwrap<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface Bookable {
  id: string;
  businessId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  allocationStrategy: string;
  priceAmount: number;
  currency: string;
  active: boolean;
}

/**
 * Enriched bookable for storefront cards. Each item carries the
 * strategy-specific bits a card needs so no per-bookable follow-up calls are
 * required to render a listing. Enrichments are null when not applicable.
 */
export interface BookableBrowseItem {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  allocationStrategy: string;
  fulfillmentType: string;
  priceAmount: number;
  currency: string;
  durationMinutes?: number | null;
  nextOccurrence: {
    id: string;
    startTime: string;
    endTime: string;
    remaining: number;
    deliveryType: "PHYSICAL" | "VIRTUAL";
  } | null;
  venueInfo: { name: string; address: string | null } | null;
  startingRate: number | null;
  resourceCount: number;
}

export interface BookableResource {
  id: string;
  bookableId: string;
  type: string;
  name: string;
  capacity: number;
  active: boolean;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  remaining: number;
}

export interface Reservation {
  id: string;
  bookableId: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: "HELD" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  holdExpiresAt?: string | null;
  partySize?: number | null;
  notes?: string | null;
  /** Cover charge / deposit required to confirm this booking (global setting). */
  depositAmount?: number | null;
  depositPaid?: boolean;
  /** Present on virtual event bookings — exchange at /join/{token} */
  joinToken?: string | null;
  createdAt: string;
}

export interface DepositInitiateResult {
  reservationId: string;
  orderId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayKeyId: string | null;
  paymentPageUrl?: string;
}

export interface CreateReservationInput {
  businessId: number;
  bookableId: string;
  /** Omit for TABLE bookables — the smallest fitting table is auto-assigned */
  resourceId?: string;
  /** Omit for CAPACITY_POOL — times come from the occurrence */
  startTime?: string;
  /** Check-out for DATE_RANGE stays (exclusive) */
  endTime?: string;
  /** Required for CAPACITY_POOL (event) bookings */
  eventOccurrenceId?: string;
  /** Required for SEATED_INVENTORY bookings: the seats to claim */
  seatIds?: string[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  partySize?: number;
  notes?: string;
}

export interface EventOccurrence {
  id: string;
  bookableId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  /** Set for SEATED_INVENTORY (ticketed) occurrences */
  seatMapId?: string | null;
  deliveryType: "PHYSICAL" | "VIRTUAL";
  active: boolean;
}

export interface SeatInfo {
  id: string;
  rowIndex: number;
  colIndex: number;
  label: string;
  taken: boolean;
}

export interface SeatStatus {
  occurrenceId: string;
  seatMapId: string;
  sections: Array<{
    id: string;
    name: string;
    rows: number;
    cols: number;
    priceOverride?: number | null;
    seats: SeatInfo[];
  }>;
}

export interface Ticket {
  id: string;
  reservationId: string;
  eventOccurrenceId: string;
  seatLabel: string;
  code: string;
  status: "ISSUED" | "CHECKED_IN" | "CANCELLED";
  checkedInAt?: string | null;
  createdAt: string;
}

export interface JoinInfo {
  reservationId: string;
  customerName?: string | null;
  startTime: string;
  endTime: string;
  provider?: string | null;
  joinUrl?: string | null;
  passcode?: string | null;
}

export interface Entitlement {
  id: string;
  subjectType: "BOOKABLE" | "EVENT_OCCURRENCE" | "COURSE";
  subjectId: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  expiresAt?: string | null;
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  available: boolean;
}

export interface StayQuote {
  nights: Array<{ date: string; rate: number }>;
  nightCount: number;
  total: number;
  currency: string;
  ratePlanId: string | null;
}

export const reservationsApi = createApi({
  reducerPath: "reservationsApi",
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
  tagTypes: ["Availability", "MyReservations"],
  endpoints: (builder) => ({
    getBookables: builder.query<Bookable[], { businessId: number }>({
      query: ({ businessId }) =>
        `/storefront/reservations/bookables?businessId=${businessId}`,
      transformResponse: (r) => unwrap<Bookable[]>(r) || [],
    }),

    getBookablesBrowse: builder.query<BookableBrowseItem[], { businessId: number }>({
      query: ({ businessId }) =>
        `/storefront/reservations/browse?businessId=${businessId}`,
      transformResponse: (r) => unwrap<BookableBrowseItem[]>(r) || [],
    }),

    getResources: builder.query<
      BookableResource[],
      { businessId: number; bookableId: string }
    >({
      query: ({ businessId, bookableId }) =>
        `/storefront/reservations/resources?businessId=${businessId}&bookableId=${bookableId}`,
      transformResponse: (r) => unwrap<BookableResource[]>(r) || [],
    }),

    getAvailability: builder.query<
      AvailabilitySlot[],
      {
        businessId: number;
        bookableId: string;
        resourceId?: string;
        date: string;
        partySize?: number;
      }
    >({
      query: ({ businessId, bookableId, resourceId, date, partySize }) => {
        const params = new URLSearchParams({
          businessId: String(businessId),
          bookableId,
          date,
        });
        if (resourceId) params.set("resourceId", resourceId);
        if (partySize != null) params.set("partySize", String(partySize));
        return `/storefront/reservations/availability?${params.toString()}`;
      },
      transformResponse: (r) => unwrap<AvailabilitySlot[]>(r) || [],
      providesTags: ["Availability"],
    }),

    getCalendar: builder.query<
      CalendarDay[],
      { businessId: number; bookableId: string; resourceId: string; from: string; days?: number }
    >({
      query: ({ businessId, bookableId, resourceId, from, days }) => {
        const params = new URLSearchParams({
          businessId: String(businessId),
          bookableId,
          resourceId,
          from,
        });
        if (days != null) params.set("days", String(days));
        return `/storefront/reservations/calendar?${params.toString()}`;
      },
      transformResponse: (r) => unwrap<CalendarDay[]>(r) || [],
      providesTags: ["Availability"],
    }),

    getQuote: builder.query<
      StayQuote,
      { businessId: number; bookableId: string; startDate: string; endDate: string }
    >({
      query: ({ businessId, bookableId, startDate, endDate }) =>
        `/storefront/reservations/quote?businessId=${businessId}&bookableId=${bookableId}&startDate=${startDate}&endDate=${endDate}`,
      transformResponse: (r) => unwrap<StayQuote>(r),
    }),

    getOccurrences: builder.query<
      EventOccurrence[],
      { businessId: number; bookableId: string }
    >({
      query: ({ businessId, bookableId }) =>
        `/storefront/reservations/occurrences?businessId=${businessId}&bookableId=${bookableId}`,
      transformResponse: (r) => unwrap<EventOccurrence[]>(r) || [],
      providesTags: ["Availability"],
    }),

    getOccurrenceSeats: builder.query<
      SeatStatus,
      { businessId: number; occurrenceId: string }
    >({
      query: ({ businessId, occurrenceId }) =>
        `/storefront/reservations/occurrences/${occurrenceId}/seats?businessId=${businessId}`,
      transformResponse: (r) => unwrap<SeatStatus>(r),
      providesTags: ["Availability"],
    }),

    getMyTickets: builder.query<Ticket[], void>({
      query: () => "/storefront/reservations/tickets/mine",
      transformResponse: (r) => unwrap<Ticket[]>(r) || [],
      providesTags: ["MyReservations"],
    }),

    getJoinInfo: builder.query<JoinInfo, { token: string }>({
      query: ({ token }) => `/storefront/reservations/join/${token}`,
      transformResponse: (r) => unwrap<JoinInfo>(r),
    }),

    getMyEntitlements: builder.query<Entitlement[], void>({
      query: () => "/storefront/reservations/entitlements/mine",
      transformResponse: (r) => unwrap<Entitlement[]>(r) || [],
      providesTags: ["MyReservations"],
    }),

    createReservation: builder.mutation<Reservation, CreateReservationInput>({
      query: ({ businessId: _, ...body }) => ({
        url: "/storefront/reservations",
        method: "POST",
        body,
      }),
      transformResponse: (r) => unwrap<Reservation>(r),
      invalidatesTags: ["Availability", "MyReservations"],
    }),

    getMyReservations: builder.query<Reservation[], void>({
      query: () => "/storefront/reservations/mine",
      transformResponse: (r) => unwrap<Reservation[]>(r) || [],
      providesTags: ["MyReservations"],
    }),

    cancelReservation: builder.mutation<Reservation, { id: string }>({
      query: ({ id }) => ({
        url: `/storefront/reservations/${id}/cancel`,
        method: "PATCH",
      }),
      transformResponse: (r) => unwrap<Reservation>(r),
      invalidatesTags: ["Availability", "MyReservations"],
    }),

    initiateReservationDeposit: builder.mutation<
      DepositInitiateResult,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/storefront/reservations/${id}/deposit/initiate`,
        method: "POST",
      }),
      transformResponse: (r) => unwrap<DepositInitiateResult>(r),
    }),

    confirmReservationDeposit: builder.mutation<
      { reservation: Reservation },
      { id: string; razorpayPaymentId: string; razorpaySignature: string }
    >({
      query: ({ id, razorpayPaymentId, razorpaySignature }) => ({
        url: `/storefront/reservations/${id}/deposit/confirm`,
        method: "POST",
        body: { razorpayPaymentId, razorpaySignature },
      }),
      transformResponse: (r) => unwrap<{ reservation: Reservation }>(r),
      invalidatesTags: ["MyReservations"],
    }),
  }),
});

export const {
  useGetBookablesQuery,
  useGetBookablesBrowseQuery,
  useGetResourcesQuery,
  useGetAvailabilityQuery,
  useGetCalendarQuery,
  useGetQuoteQuery,
  useGetOccurrencesQuery,
  useGetOccurrenceSeatsQuery,
  useGetMyTicketsQuery,
  useGetJoinInfoQuery,
  useGetMyEntitlementsQuery,
  useCreateReservationMutation,
  useGetMyReservationsQuery,
  useCancelReservationMutation,
  useInitiateReservationDepositMutation,
  useConfirmReservationDepositMutation,
} = reservationsApi;
