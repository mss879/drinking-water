import { TIME_ZONE } from "@/lib/admin/format";

export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "12m" | "custom";
export type Bucket = "hour" | "day" | "week" | "month";

export type Range = {
  key: RangeKey;
  label: string;
  from: Date;
  to: Date;
  /** The same length of time just before, for the "vs previous period" deltas. */
  prevFrom: Date;
  prevTo: Date;
  bucket: Bucket;
  /** For the custom range inputs (YYYY-MM-DD, inclusive). */
  fromDay: string;
  toDay: string;
};

export const RANGE_PRESETS: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "12m", label: "12 months" },
];

const DAY = 86_400_000;
const isoDay = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
/** Midnight in Sri Lanka (UTC+5:30 all year) for a YYYY-MM-DD day. */
const midnight = (day: string) => new Date(`${day}T00:00:00+05:30`);

/** Works out a reporting period in Sri Lanka time from the page's ?range=, ?from= and ?to=. */
export function resolveRange(key: string | undefined, fromParam?: string, toParam?: string, now = new Date()): Range {
  const today = midnight(isoDay(now));
  const make = (k: RangeKey, label: string, from: Date, to: Date, bucket: Bucket): Range => {
    const span = to.getTime() - from.getTime();
    return {
      key: k,
      label,
      from,
      to,
      prevFrom: new Date(from.getTime() - span),
      prevTo: from,
      bucket,
      fromDay: isoDay(from),
      toDay: isoDay(new Date(to.getTime() - 1)),
    };
  };

  if (key === "custom" && fromParam && toParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam) && /^\d{4}-\d{2}-\d{2}$/.test(toParam)) {
    let from = midnight(fromParam);
    let to = new Date(midnight(toParam).getTime() + DAY);
    if (from > to) [from, to] = [new Date(to.getTime() - DAY), new Date(from.getTime() + DAY)];
    if (to > now) to = now;
    const days = (to.getTime() - from.getTime()) / DAY;
    return make("custom", `${fromParam} to ${toParam}`, from, to, days <= 2 ? "hour" : days <= 120 ? "day" : "week");
  }

  switch (key) {
    case "today":
      return make("today", "Today", today, now, "hour");
    case "yesterday":
      return make("yesterday", "Yesterday", new Date(today.getTime() - DAY), today, "hour");
    case "7d":
      return make("7d", "Last 7 days", new Date(today.getTime() - 6 * DAY), now, "day");
    case "90d":
      return make("90d", "Last 90 days", new Date(today.getTime() - 89 * DAY), now, "day");
    case "12m": {
      const [year, month] = isoDay(now).split("-").map(Number);
      const start = new Date(Date.UTC(year, month - 12, 1));
      return make("12m", "Last 12 months", midnight(start.toISOString().slice(0, 10)), now, "week");
    }
    default:
      return make("30d", "Last 30 days", new Date(today.getTime() - 29 * DAY), now, "day");
  }
}

const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hour12: true });
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "short" });
const longDayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "short", day: "numeric", month: "short" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, month: "short", year: "numeric" });

/** Axis label and tooltip label for one bucket of a time series. */
export function bucketLabels(iso: string, bucket: Bucket) {
  const date = new Date(iso);
  switch (bucket) {
    case "hour":
      return { label: hourFmt.format(date).replace(" ", ""), detail: `${longDayFmt.format(date)}, ${hourFmt.format(date).replace(" ", "")}` };
    case "week":
      return { label: dayFmt.format(date), detail: `Week of ${dayFmt.format(date)}` };
    case "month":
      return { label: monthFmt.format(date), detail: monthFmt.format(date) };
    default:
      return { label: dayFmt.format(date), detail: longDayFmt.format(date) };
  }
}
