import type { Metadata } from "next";
import { ChartLine, CircleCheck, CircleDashed, TriangleAlert } from "lucide-react";
import { BarList } from "@/components/admin/charts/bar-list";
import { Heatmap } from "@/components/admin/charts/heatmap";
import { TrendChart } from "@/components/admin/charts/trend-chart";
import { LiveVisitors } from "@/components/admin/analytics/live-visitors";
import { PurgeControl } from "@/components/admin/analytics/purge-control";
import { RangeFilter } from "@/components/admin/analytics/range-filter";
import { TabbedList } from "@/components/admin/analytics/tabbed-list";
import { TrackingToggle } from "@/components/admin/analytics/tracking-toggle";
import { EmptyState, PageHeader, Panel } from "@/components/admin/ui/panel";
import { StatTile } from "@/components/admin/ui/stat-tile";
import { getLiveVisitors } from "@/app/actions/admin/analytics";
import { cn } from "@/lib/cn";
import { change, loadAnalytics, type BreakdownRow } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDuration, formatNumber, formatPercent } from "@/lib/admin/format";
import { formTypeLabels } from "@/lib/admin/inquiries";
import { resolveRange } from "@/lib/admin/ranges";

export const metadata: Metadata = { title: "Web analytics" };

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);
const regions = new Intl.DisplayNames(["en"], { type: "region" });

const channelLabels: Record<string, string> = {
  direct: "Direct (typed or bookmarked)",
  organic: "Search engines",
  social: "Social media",
  referral: "Other websites",
  email: "Email",
  paid: "Paid ads",
  ai: "AI assistants",
};

const eventLabels: Record<string, string> = {
  whatsapp_click: "WhatsApp taps",
  phone_click: "Phone taps",
  email_click: "Email taps",
  outbound_click: "Links to other sites",
  cta_click: "Call-to-action clicks",
  file_download: "Downloads",
  product_view: "Product page views",
  rental_quote_calculated: "Rental calculator used",
  find_solution_completed: "Find my solution completed",
};

/** Google's Core Web Vitals thresholds (good up to the first number, poor beyond the second). */
const vitalsInfo: Record<string, { name: string; good: number; poor: number; unit: "ms" | "" }> = {
  LCP: { name: "Largest content shown", good: 2500, poor: 4000, unit: "ms" },
  INP: { name: "Response to taps and clicks", good: 200, poor: 500, unit: "ms" },
  CLS: { name: "Layout shifting", good: 0.1, poor: 0.25, unit: "" },
  FCP: { name: "First content shown", good: 1800, poor: 3000, unit: "ms" },
  TTFB: { name: "Server response", good: 800, poor: 1800, unit: "ms" },
};

function rows(list: BreakdownRow[], label: (value: string) => string = (value) => value, withTime = false) {
  return list.map((row) => ({
    label: label(row.label),
    value: row.total,
    secondary: withTime && row.avg_engaged_ms ? formatDuration(row.avg_engaged_ms) : undefined,
  }));
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const range = resolveRange(one(params.range), one(params.from), one(params.to));
  const [data, live] = await Promise.all([loadAnalytics(supabase, range), getLiveVisitors()]);
  const { overview: now, previous: before } = data;

  const bounce = now.sessions ? 1 - now.engaged_sessions / now.sessions : 0;
  const bouncePrev = before.sessions ? 1 - before.engaged_sessions / before.sessions : 0;
  const perVisit = now.sessions ? now.pageviews / now.sessions : 0;
  const perVisitPrev = before.sessions ? before.pageviews / before.sessions : 0;
  const leads = Object.values(data.inquiries).reduce((sum, value) => sum + value, 0);
  const conversion = now.visitors ? leads / now.visitors : 0;
  const nothingYet = now.sessions === 0 && before.sessions === 0;

  return (
    <>
      <PageHeader
        title="Web analytics"
        description={`${range.label}, in Sri Lanka time. Visitors are counted without cookies; no IP addresses are stored.`}
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <RangeFilter active={range.key} fromDay={range.fromDay} toDay={range.toDay} />
        <TrackingToggle />
      </div>

      {nothingYet && (
        <div className="card-line mb-6">
          <EmptyState icon={<ChartLine />} title="No visits recorded yet">
            The tracker starts counting once the live site is connected to Supabase. Visits from local development and
            from browsers where an admin has signed in aren’t counted.
          </EmptyState>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <LiveVisitors initial={live.ok && live.data ? live.data : { visitors: 0, pages: [] }} showPages />
        <StatTile label="Visitors" value={formatNumber(now.visitors)} delta={change(now.visitors, before.visitors)} trend={data.series.map((p) => p.visitors)} />
        <StatTile label="Page views" value={formatNumber(now.pageviews)} delta={change(now.pageviews, before.pageviews)} trend={data.series.map((p) => p.pageviews)} />
        <StatTile label="Visits" value={formatNumber(now.sessions)} delta={change(now.sessions, before.sessions)} />
        <StatTile label="Pages per visit" value={perVisit.toFixed(1)} delta={change(perVisit, perVisitPrev)} />
        <StatTile label="Bounce rate" value={formatPercent(bounce)} delta={change(bounce, bouncePrev)} goodWhenUp={false} />
        <StatTile label="Average visit" value={formatDuration(now.avg_session_ms)} delta={change(now.avg_session_ms, before.avg_session_ms)} hint="Time the pages were on screen" />
        <StatTile label="Inquiry rate" value={formatPercent(conversion, 1)} hint={`${leads} ${leads === 1 ? "inquiry" : "inquiries"} from ${formatNumber(now.visitors)} visitors`} />
      </div>

      <Panel title="Visitors and page views" className="mt-4">
        {data.series.length > 0 ? <TrendChart points={data.series} /> : <p className="py-10 text-center text-sm text-muted">No data for this period.</p>}
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <TabbedList
          title="Pages"
          tabs={[
            { key: "path", label: "Top pages", rows: rows(data.lists.path, undefined, true), valueLabel: "Views" },
            { key: "entry", label: "Entry", rows: rows(data.lists.entry_path), valueLabel: "Visits" },
            { key: "exit", label: "Exit", rows: rows(data.lists.exit_path), valueLabel: "Visits" },
          ]}
        />
        <TabbedList
          title="Where visitors come from"
          tabs={[
            { key: "channel", label: "Channels", rows: rows(data.lists.channel, (value) => channelLabels[value] ?? value), valueLabel: "Visits" },
            { key: "referrer", label: "Websites", rows: rows(data.lists.referrer_host), valueLabel: "Visits", empty: "No visits from other websites in this period." },
            {
              key: "campaign",
              label: "Campaigns",
              rows: rows(data.lists.utm_campaign),
              valueLabel: "Visits",
              empty: "No tagged links (utm_campaign) in this period.",
            },
            { key: "source", label: "UTM source", rows: rows(data.lists.utm_source), valueLabel: "Visits", empty: "No utm_source tags in this period." },
          ]}
        />
        <TabbedList
          title="Locations"
          tabs={[
            { key: "country", label: "Countries", rows: rows(data.lists.country, (code) => regions.of(code) ?? code), valueLabel: "Visits" },
            {
              key: "city",
              label: "Cities",
              rows: rows(data.lists.city, (value) => {
                const [city, code] = value.split(", ");
                return code ? `${city}, ${regions.of(code) ?? code}` : value;
              }),
              valueLabel: "Visits",
              empty: "City data comes from the host (Vercel, Cloudflare or Netlify). Without it only the country is estimated.",
            },
          ]}
        />
        <TabbedList
          title="Devices"
          tabs={[
            { key: "device", label: "Type", rows: rows(data.lists.device, (value) => value[0].toUpperCase() + value.slice(1)), valueLabel: "Visits" },
            { key: "browser", label: "Browser", rows: rows(data.lists.browser), valueLabel: "Visits" },
            { key: "os", label: "System", rows: rows(data.lists.os), valueLabel: "Visits" },
            { key: "screen", label: "Screen", rows: rows(data.lists.screen), valueLabel: "Visits" },
            { key: "language", label: "Language", rows: rows(data.lists.language), valueLabel: "Visits" },
          ]}
        />

        <Panel title="Inquiries and actions" description="Form submissions are counted from the inquiries themselves.">
          <BarList
            valueLabel="Count"
            rows={[
              ...Object.entries(data.inquiries).map(([type, value]) => ({
                label: `${formTypeLabels[type as keyof typeof formTypeLabels]} form`,
                value,
              })),
              ...Object.entries(eventLabels)
                .filter(([name]) => data.events[name]?.events)
                .map(([name, label]) => ({
                  label,
                  value: data.events[name].events,
                  secondary: `${data.events[name].visitors} ${data.events[name].visitors === 1 ? "person" : "people"}`,
                })),
            ].filter((row) => row.value > 0)}
            empty="No inquiries or tracked actions in this period."
          />
        </Panel>

        <Panel title="New and returning visitors">
          <BarList
            valueLabel="Visitors"
            rows={[
              { label: "New visitors", value: now.new_visitors },
              { label: "Returning visitors", value: now.returning_visitors },
            ].filter((row) => row.value > 0)}
          />
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-muted">Time on a page</dt>
              <dd className="mt-0.5 font-semibold text-ink">{formatDuration(now.avg_page_ms)}</dd>
            </div>
            <div>
              <dt className="text-muted">Scrolled, on average</dt>
              <dd className="mt-0.5 font-semibold text-ink">{now.avg_scroll}% of the page</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel title="When people visit" description="Visitors by weekday and hour, Sri Lanka time." className="mt-4">
        <Heatmap cells={data.heatmap} />
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Site speed (Core Web Vitals)" description="75th percentile from real visitors." className="xl:col-span-2">
          {data.vitals.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No speed readings in this period yet.</p>
          ) : (
            <ul className="grid gap-4">
              {data.vitals.map((vital) => {
                const info = vitalsInfo[vital.name];
                const p75 = Number(vital.p75);
                const rating = !info ? "" : p75 <= info.good ? "Good" : p75 <= info.poor ? "Needs work" : "Poor";
                const Icon = rating === "Good" ? CircleCheck : rating === "Poor" ? TriangleAlert : CircleDashed;
                const total = Number(vital.samples) || 1;
                const parts = [
                  { label: "Good", value: Number(vital.good), tone: "bg-deep" },
                  { label: "Needs work", value: Number(vital.needs_improvement), tone: "bg-brand/60" },
                  { label: "Poor", value: Number(vital.poor), tone: "bg-ink/70" },
                ];
                return (
                  <li key={vital.name} className="grid gap-2 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center sm:gap-5">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {info?.name ?? vital.name} <span className="font-normal text-muted">({vital.name})</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                        <Icon aria-hidden className={cn("size-3.5", rating === "Poor" ? "text-ink" : "text-deep")} />
                        <span className="font-semibold text-ink tabular-nums">
                          {info?.unit === "ms" ? (p75 >= 1000 ? `${(p75 / 1000).toFixed(1)} s` : `${Math.round(p75)} ms`) : p75.toFixed(2)}
                        </span>
                        · {rating} · {formatNumber(Number(vital.samples))} readings
                      </p>
                    </div>
                    <div>
                      <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full" aria-hidden>
                        {parts.map((part) =>
                          part.value ? <span key={part.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", part.tone)} style={{ width: `${(part.value / total) * 100}%` }} /> : null,
                        )}
                      </div>
                      <p className="mt-1.5 flex flex-wrap gap-x-4 text-[12px] text-muted">
                        {parts.map((part) => (
                          <span key={part.label} className="inline-flex items-center gap-1.5">
                            <span aria-hidden className={cn("size-2 rounded-full", part.tone)} />
                            {part.label} {Math.round((part.value / total) * 100)}%
                          </span>
                        ))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <TabbedList
          title="Also worth knowing"
          tabs={[
            { key: "products", label: "Products viewed", rows: data.products.map((row) => ({ label: row.label, value: row.events })), valueLabel: "Views", empty: "No product page views in this period." },
            { key: "404", label: "Broken links", rows: data.notFound.map((row) => ({ label: row.label, value: row.events })), valueLabel: "Hits", empty: "No visits to missing pages. Good." },
          ]}
        />
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <PurgeControl />
      </div>
    </>
  );
}
