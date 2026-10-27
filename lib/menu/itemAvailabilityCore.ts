import { formatClock } from "@/lib/store/operationalHours";

/**
 * Dish serving times (Breakfast only, weekends 7–11 am, …). The backend sends each dish's weekly
 * windows in store time; the menu re-checks them on a 30-second tick because the page can be
 * served from cache. The cart and checkout enforce the same rule server-side (ITEM_NOT_AVAILABLE_NOW).
 */

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
type Weekday = (typeof WEEKDAYS)[number];

export type ServingWindow = { day: string; from: string; to: string };

export type AvailabilityFields = {
  servingWindows?: ServingWindow[] | null;
  availabilityHidden?: boolean | null;
  availableNow?: boolean | null;
  availabilityLabel?: string | null;
};

export type ItemAvailability = {
  availableNow: boolean;
  /** e.g. "Available from 7:00 PM"; null while available. */
  label: string | null;
  /** The store hides this dish outside its serving times. */
  hidden: boolean;
};

export const ALWAYS_AVAILABLE: ItemAvailability = { availableNow: true, label: null, hidden: false };

function minutesOf(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function localParts(now: Date, timeZone: string): { weekday: Weekday; minutes: number } {
  let zone = timeZone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
  } catch {
    zone = "Asia/Kolkata";
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { weekday: String(parts.weekday).toLowerCase() as Weekday, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function resolveItemAvailability(
  item: AvailabilityFields | null | undefined,
  timezone: string | null | undefined,
  now: Date = new Date(),
): ItemAvailability {
  const windows = item?.servingWindows;
  if (!Array.isArray(windows)) return ALWAYS_AVAILABLE;
  const { weekday, minutes } = localParts(now, timezone || "Asia/Kolkata");
  const on = (day: Weekday) => windows.filter((w) => w.day === day);
  const today = on(weekday);
  const yesterday = on(WEEKDAYS[(WEEKDAYS.indexOf(weekday) + 6) % 7]);

  const inToday = today.some((w) => {
    const from = minutesOf(w.from);
    const to = minutesOf(w.to);
    return to < from ? minutes >= from : minutes >= from && minutes <= to;
  });
  // Yesterday's late window running past midnight (22:00–02:00 still open at 01:30).
  const inTail = yesterday.some((w) => minutesOf(w.to) < minutesOf(w.from) && minutes <= minutesOf(w.to));
  if (inToday || inTail) return ALWAYS_AVAILABLE;

  const hidden = item?.availabilityHidden === true;
  const laterToday = today.map((w) => w.from).filter((from) => minutesOf(from) > minutes).sort()[0];
  if (laterToday) return { availableNow: false, hidden, label: `Available from ${formatClock(laterToday)}` };
  const index = WEEKDAYS.indexOf(weekday);
  for (let offset = 1; offset <= 7; offset++) {
    const day = WEEKDAYS[(index + offset) % 7];
    const first = on(day).map((w) => w.from).sort()[0];
    if (first) {
      const when = offset === 1 ? "tomorrow" : day.charAt(0).toUpperCase() + day.slice(1, 3);
      return { availableNow: false, hidden, label: `Available ${when} from ${formatClock(first)}` };
    }
  }
  return { availableNow: false, hidden, label: "Not available right now" };
}

/** Fields to add to a catalog item query (backends without them fall back to the query without). */
export const AVAILABILITY_GQL_FIELDS = "availableNow availabilityLabel availabilityHidden servingWindows { day from to }";

