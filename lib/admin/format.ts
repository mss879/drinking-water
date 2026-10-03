/** Dates in the admin are shown in Sri Lanka time, whatever the server's clock says. */
export const TIME_ZONE = "Asia/Colombo";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const dateOnly = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "short", year: "numeric" });
const shortDate = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "short" });

export function formatDateTime(iso: string | null | undefined) {
  return iso ? dateTime.format(new Date(iso)) : "—";
}

export function formatDate(iso: string | null | undefined) {
  return iso ? dateOnly.format(new Date(iso)) : "—";
}

export function formatShortDate(iso: string | Date) {
  return shortDate.format(typeof iso === "string" ? new Date(iso) : iso);
}

/** "just now", "5 min ago", "3 h ago", "yesterday", then a date. */
export function formatAgo(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return "—";
  const seconds = Math.round((now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 172800) return "yesterday";
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} days ago`;
  return formatDate(iso);
}

/** Today's date in Sri Lanka as YYYY-MM-DD (for follow-up dates). */
export function todayInColombo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/** 1 h 05 min · 3 min 20 s · 45 s. */
export function formatDuration(ms: number | null | undefined) {
  const total = Math.round((ms ?? 0) / 1000);
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}m ${String(total % 60).padStart(2, "0")}s`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

const integer = new Intl.NumberFormat("en-LK");
export function formatNumber(value: number | null | undefined) {
  return integer.format(Math.round(value ?? 0));
}

export function formatPercent(value: number | null | undefined, digits = 0) {
  return `${((value ?? 0) * 100).toFixed(digits)}%`;
}

/** Phone number as digits for wa.me links: local Sri Lankan numbers get the 94 country code. */
export function whatsappNumber(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  return digits.length === 9 ? `94${digits}` : digits;
}
