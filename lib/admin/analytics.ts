import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { bucketLabels, type Range } from "@/lib/admin/ranges";
import type { Database, InquiryFormType } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type Overview = {
  visitors: number;
  sessions: number;
  pageviews: number;
  engaged_sessions: number;
  converted_sessions: number;
  avg_session_ms: number;
  avg_page_ms: number;
  avg_scroll: number;
  new_visitors: number;
  returning_visitors: number;
};

const emptyOverview: Overview = {
  visitors: 0,
  sessions: 0,
  pageviews: 0,
  engaged_sessions: 0,
  converted_sessions: 0,
  avg_session_ms: 0,
  avg_page_ms: 0,
  avg_scroll: 0,
  new_visitors: 0,
  returning_visitors: 0,
};

export async function loadOverview(supabase: Client, from: Date, to: Date): Promise<Overview> {
  const { data, error } = await supabase.rpc("analytics_overview", { p_from: from.toISOString(), p_to: to.toISOString() });
  if (error) throw new Error(error.message);
  return { ...emptyOverview, ...((data ?? {}) as Partial<Overview>) };
}

export async function loadSeries(supabase: Client, range: Range) {
  const { data, error } = await supabase.rpc("analytics_timeseries", {
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_bucket: range.bucket,
    p_tz: "Asia/Colombo",
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...bucketLabels(row.bucket, range.bucket), visitors: Number(row.visitors), pageviews: Number(row.pageviews) }));
}

export const DIMENSIONS = [
  "path",
  "entry_path",
  "exit_path",
  "channel",
  "referrer_host",
  "utm_campaign",
  "utm_source",
  "country",
  "city",
  "device",
  "browser",
  "os",
  "screen",
  "language",
] as const;
export type Dimension = (typeof DIMENSIONS)[number];
export type BreakdownRow = { label: string; visitors: number; total: number; avg_engaged_ms: number | null };

async function breakdown(supabase: Client, range: Range, dimension: Dimension, limit = 10): Promise<BreakdownRow[]> {
  const { data, error } = await supabase.rpc("analytics_breakdown", {
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_dimension: dimension,
    p_limit: limit,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...row, visitors: Number(row.visitors), total: Number(row.total) }));
}

async function eventBreakdown(supabase: Client, range: Range, name: string, prop: string) {
  const { data, error } = await supabase.rpc("analytics_event_breakdown", {
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_name: name,
    p_prop: prop,
    p_limit: 10,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ label: row.label, events: Number(row.events), visitors: Number(row.visitors) }));
}

/** Everything the analytics page shows for a period, fetched in parallel. */
export async function loadAnalytics(supabase: Client, range: Range) {
  const span = { p_from: range.from.toISOString(), p_to: range.to.toISOString() };
  const [overview, previous, series, lists, events, heatmap, vitals, notFound, products, inquiries] = await Promise.all([
    loadOverview(supabase, range.from, range.to),
    loadOverview(supabase, range.prevFrom, range.prevTo),
    loadSeries(supabase, range),
    Promise.all(DIMENSIONS.map((dimension) => breakdown(supabase, range, dimension))).then(
      (results) => Object.fromEntries(DIMENSIONS.map((dimension, i) => [dimension, results[i]])) as Record<Dimension, BreakdownRow[]>,
    ),
    supabase.rpc("analytics_events_summary", span).then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return Object.fromEntries((data ?? []).map((row) => [row.name, { events: Number(row.events), visitors: Number(row.visitors) }])) as Record<
        string,
        { events: number; visitors: number }
      >;
    }),
    supabase.rpc("analytics_heatmap", { ...span, p_tz: "Asia/Colombo" }).then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => ({ weekday: row.weekday, hour: row.hour, visitors: Number(row.visitors) }));
    }),
    supabase.rpc("analytics_vitals_summary", span).then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return data ?? [];
    }),
    eventBreakdown(supabase, range, "page_not_found", "path"),
    eventBreakdown(supabase, range, "product_view", "product_name"),
    // Form submissions come from the inquiries themselves, which ad blockers can't hide.
    supabase
      .from("inquiries")
      .select("form_type")
      .gte("created_at", span.p_from)
      .lt("created_at", span.p_to)
      .neq("status", "spam")
      .then(({ data, error }) => {
        if (error) throw new Error(error.message);
        const counts: Record<InquiryFormType, number> = { buy: 0, rental: 0, corporate: 0, service: 0 };
        for (const row of data ?? []) counts[row.form_type] += 1;
        return counts;
      }),
  ]);
  return { overview, previous, series, lists, events, heatmap, vitals, notFound, products, inquiries };
}

/** Relative change, or null when there's nothing to compare with. */
export function change(current: number, previous: number) {
  if (!previous) return current ? null : 0;
  return (current - previous) / previous;
}
