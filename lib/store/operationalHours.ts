export const STORE_CLOSED_CODE = "STORE_CLOSED";
export const STORE_CLOSED_MESSAGE = "We are closed";

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type DayHours = {
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  notes?: string;
};

export type BusinessHours = {
  timezone?: string;
  specialHours?: Record<string, DayHours>;
} & Partial<Record<(typeof WEEKDAYS)[number], DayHours>>;

function parseMinutes(value?: string | null): number | null {
  const match = String(value || "").trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function partsInZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    weekday: String(parts.weekday || "").toLowerCase(),
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function hasConfiguredHours(hours?: BusinessHours | null): boolean {
  if (!hours || typeof hours !== "object") return false;
  return WEEKDAYS.some((day) => hours[day] && typeof hours[day] === "object");
}

function isOpenForDay(day: DayHours | undefined, minutes: number): boolean {
  if (!day || day.isOpen === false) return false;
  const open = parseMinutes(day.openTime);
  const close = parseMinutes(day.closeTime);
  if (open == null || close == null) return true;
  if (close < open) {
    return minutes >= open || minutes <= close;
  }
  return minutes >= open && minutes <= close;
}

export function isWithinOperationalHours(
  hours?: BusinessHours | null,
  timezone?: string | null,
  now: Date = new Date(),
): boolean {
  if (!hasConfiguredHours(hours)) return true;
  const zone = timezone || hours?.timezone || "Asia/Kolkata";
  let parts: ReturnType<typeof partsInZone>;
  try {
    parts = partsInZone(now, zone);
  } catch {
    parts = partsInZone(now, "Asia/Kolkata");
  }
  const minutes = parts.hour * 60 + parts.minute;
  const ymd = `${parts.year}-${parts.month}-${parts.day}`;
  const special = hours?.specialHours?.[ymd];
  if (special) return isOpenForDay(special, minutes);
  const weekday = WEEKDAYS.includes(parts.weekday as (typeof WEEKDAYS)[number])
    ? (parts.weekday as (typeof WEEKDAYS)[number])
    : null;
  if (!weekday) return true;
  return isOpenForDay(hours?.[weekday], minutes);
}

export function isStoreAcceptingOrders(
  opts: {
    isStoreOpen?: boolean | null;
    businessHours?: BusinessHours | null;
    timezone?: string | null;
  },
  now: Date = new Date(),
): boolean {
  if (opts.isStoreOpen === false) return false;
  return isWithinOperationalHours(opts.businessHours, opts.timezone, now);
}

export function formatClock(value?: string | null): string {
  const minutes = parseMinutes(value);
  if (minutes == null) return "";
  const hour24 = Math.floor(minutes / 60);
  const min = minutes % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(min).padStart(2, "0")} ${suffix}`;
}

export function todayHoursLabel(
  hours?: BusinessHours | null,
  timezone?: string | null,
  now: Date = new Date(),
): string | null {
  if (!hasConfiguredHours(hours)) return null;
  const zone = timezone || hours?.timezone || "Asia/Kolkata";
  let parts: ReturnType<typeof partsInZone>;
  try {
    parts = partsInZone(now, zone);
  } catch {
    parts = partsInZone(now, "Asia/Kolkata");
  }
  const ymd = `${parts.year}-${parts.month}-${parts.day}`;
  const weekday = parts.weekday as (typeof WEEKDAYS)[number];
  const day = hours?.specialHours?.[ymd] || hours?.[weekday];
  if (!day || day.isOpen === false) return "Closed today";
  const open = formatClock(day.openTime);
  const close = formatClock(day.closeTime);
  if (!open || !close) return null;
  return `Hours today: ${open} – ${close}`;
}
