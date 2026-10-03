import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, Inbox, Newspaper, SquareKanban } from "lucide-react";
import { BarList } from "@/components/admin/charts/bar-list";
import { TrendChart } from "@/components/admin/charts/trend-chart";
import { LiveVisitors } from "@/components/admin/analytics/live-visitors";
import { Badge, InquiryStatusBadge } from "@/components/admin/ui/badge";
import { EmptyState, Panel } from "@/components/admin/ui/panel";
import { StatTile } from "@/components/admin/ui/stat-tile";
import { getLiveVisitors } from "@/app/actions/admin/analytics";
import { cn } from "@/lib/cn";
import { change, loadOverview, loadSeries } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/admin/auth";
import { formatAgo, formatDuration, formatNumber, formatPercent, formatShortDate, todayInColombo, TIME_ZONE } from "@/lib/admin/format";
import { formTypeLabels } from "@/lib/admin/inquiries";
import { resolveRange } from "@/lib/admin/ranges";
import { formatLKR } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
] as const;

const channelNames: Record<string, string> = {
  direct: "Direct",
  organic: "Search engines",
  social: "Social media",
  referral: "Other websites",
  email: "Email",
  paid: "Paid ads",
  ai: "AI assistants",
};

type Summary = {
  inquiries: { total: number; previous: number; unread: number };
  crm: { open_leads: number; pipeline_value: number; won: number; won_value: number; lost: number; follow_ups_due: number; follow_ups_overdue: number };
  blog: { published: number; scheduled: number; drafts: number };
  visitors: number;
};

function greeting(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(now));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

/** Everything the dashboard shows, in one round of parallel queries. */
async function loadDashboard(rangeKey: string) {
  const { supabase } = await requireAdmin();
  const range = resolveRange(rangeKey);
  const today = todayInColombo();
  const inAWeek = new Date(Date.parse(`${today}T00:00:00+05:30`) + 7 * 86_400_000).toISOString().slice(0, 10);
  const span = { p_from: range.from.toISOString(), p_to: range.to.toISOString() };

  const [now, before, series, channels, pages, summary, recent, stages, leads, followUps, posts, live] = await Promise.all([
    loadOverview(supabase, range.from, range.to),
    loadOverview(supabase, range.prevFrom, range.prevTo),
    loadSeries(supabase, range),
    supabase.rpc("analytics_breakdown", { ...span, p_dimension: "channel", p_limit: 6 }),
    supabase.rpc("analytics_breakdown", { ...span, p_dimension: "path", p_limit: 6 }),
    supabase.rpc("dashboard_summary", { ...span, p_tz: TIME_ZONE }),
    supabase.from("inquiries").select("id, name, form_type, status, read_at, created_at").neq("status", "spam").order("created_at", { ascending: false }).limit(5),
    supabase.from("crm_stages").select("id, name, outcome, position").order("position"),
    supabase.from("crm_leads").select("stage_id, value"),
    supabase
      .from("crm_leads")
      .select("id, name, interest, follow_up_on, stage_id")
      .not("follow_up_on", "is", null)
      .lte("follow_up_on", inAWeek)
      .order("follow_up_on")
      .limit(12),
    supabase.from("blog_posts").select("id, title, slug, status, published_at, updated_at").order("updated_at", { ascending: false }).limit(4),
    getLiveVisitors(),
  ]);
  if (summary.error) throw new Error(summary.error.message);

  const openStage = new Map((stages.data ?? []).map((stage) => [stage.id, stage.outcome === "open"]));
  const pipeline = (stages.data ?? [])
    .filter((stage) => stage.outcome === "open")
    .map((stage) => {
      const inStage = (leads.data ?? []).filter((lead) => lead.stage_id === stage.id);
      return { label: stage.name, value: inStage.length, total: inStage.reduce((sum, lead) => sum + (lead.value ?? 0), 0) };
    });
  const viewsByPath = new Map((pages.data ?? []).map((row) => [row.label, Number(row.total)]));

  return {
    range,
    today,
    now,
    before,
    series,
    channels: channels.data ?? [],
    pages: pages.data ?? [],
    summary: summary.data as unknown as Summary,
    recent: recent.data ?? [],
    pipeline,
    followUps: (followUps.data ?? []).filter((lead) => openStage.get(lead.stage_id)).slice(0, 6),
    posts: (posts.data ?? []).map((post) => ({
      ...post,
      state: post.status === "draft" ? "Draft" : post.published_at && post.published_at > range.to.toISOString() ? "Scheduled" : "Live",
      views: viewsByPath.get(`/blog/${post.slug}`) ?? 0,
    })),
    live: live.ok && live.data ? live.data : { visitors: 0, pages: [] },
  };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rangeKey = RANGES.some((item) => item.key === params.range) ? String(params.range) : "30d";
  const data = await loadDashboard(rangeKey);
  const { now, before, summary } = data;
  const bounce = now.sessions ? 1 - now.engaged_sessions / now.sessions : 0;
  const bouncePrev = before.sessions ? 1 - before.engaged_sessions / before.sessions : 0;
  const inquiryRate = summary.visitors ? summary.inquiries.total / summary.visitors : 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
        <div>
          <p className="text-[15px] text-muted">{new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
          <h1 className="mt-1 font-display text-[length:clamp(1.6rem,1.3rem+1vw,2.1rem)] leading-tight font-bold tracking-[-0.02em] text-ink">
            {greeting()}
          </h1>
        </div>
        <nav aria-label="Period" className="flex gap-1.5">
          {RANGES.map((item) => (
            <Link
              key={item.key}
              href={item.key === "30d" ? "/admin" : `/admin?range=${item.key}`}
              aria-current={rangeKey === item.key ? "true" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-semibold transition-colors",
                rangeKey === item.key ? "bg-deep text-white" : "bg-white text-ink ring-1 ring-line hover:ring-mist",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Website */}
      <h2 className="mb-3 font-display text-lg font-bold text-ink">Website</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <LiveVisitors initial={data.live} />
        <StatTile label="Visitors" value={formatNumber(now.visitors)} delta={change(now.visitors, before.visitors)} trend={data.series.map((p) => p.visitors)} />
        <StatTile label="Page views" value={formatNumber(now.pageviews)} delta={change(now.pageviews, before.pageviews)} trend={data.series.map((p) => p.pageviews)} />
        <StatTile label="Average visit" value={formatDuration(now.avg_session_ms)} delta={change(now.avg_session_ms, before.avg_session_ms)} />
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel
          title="Traffic"
          description={`${data.range.label} · bounce rate ${formatPercent(bounce)}${bouncePrev ? ` (was ${formatPercent(bouncePrev)})` : ""}`}
          action={
            <Link href={`/admin/analytics?range=${rangeKey}`} className="inline-flex items-center gap-1 text-sm font-semibold text-deep hover:text-ink">
              Full analytics <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          }
          className="xl:col-span-2"
        >
          <TrendChart points={data.series} />
        </Panel>
        <Panel title="Where they come from">
          <BarList
            valueLabel="Visits"
            rows={data.channels.map((row) => ({ label: channelNames[row.label] ?? row.label, value: Number(row.total) }))}
          />
          <h3 className="mt-6 mb-2 text-[13px] font-semibold text-ink">Top pages</h3>
          <BarList valueLabel="Views" rows={data.pages.slice(0, 4).map((row) => ({ label: row.label, value: Number(row.total) }))} />
        </Panel>
      </div>

      {/* Business */}
      <h2 className="mt-10 mb-3 font-display text-lg font-bold text-ink">Inquiries, pipeline and blog</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Inquiries"
          value={formatNumber(summary.inquiries.total)}
          delta={change(summary.inquiries.total, summary.inquiries.previous)}
        />
        <StatTile label="Inquiry rate" value={formatPercent(inquiryRate, 1)} hint={`Of ${formatNumber(summary.visitors)} visitors`} />
        <StatTile label="Open leads" value={formatNumber(summary.crm.open_leads)} hint={`Pipeline ${formatLKR(summary.crm.pipeline_value)}`} />
        <StatTile
          label="Won"
          value={formatNumber(summary.crm.won)}
          hint={summary.crm.won_value ? `${formatLKR(summary.crm.won_value)} · ${summary.crm.lost} lost` : `${summary.crm.lost} lost in this period`}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel
          title="Latest inquiries"
          description={summary.inquiries.unread ? `${summary.inquiries.unread} unread` : "All read"}
          action={
            <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-deep hover:text-ink">
              All inquiries <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          }
          bodyClassName="px-0 pb-2 sm:px-0"
        >
          {data.recent.length === 0 ? (
            <EmptyState icon={<Inbox />} title="No inquiries yet">
              Requests from the website’s forms will show up here.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {data.recent.map((row) => (
                <li key={row.id}>
                  <Link href={`/admin/inquiries?id=${row.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-tint sm:px-6">
                    {!row.read_at && <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand" />}
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[15px] text-ink", !row.read_at ? "font-bold" : "font-medium")}>{row.name}</span>
                      <span className="block text-[13px] text-muted">
                        {formTypeLabels[row.form_type]} · {formatAgo(row.created_at)}
                      </span>
                    </span>
                    <InquiryStatusBadge status={row.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Pipeline"
          description={`${formatNumber(summary.crm.open_leads)} open · ${formatLKR(summary.crm.pipeline_value)}`}
          action={
            <Link href="/admin/crm" className="inline-flex items-center gap-1 text-sm font-semibold text-deep hover:text-ink">
              Open the CRM <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          }
        >
          {data.pipeline.every((stage) => stage.value === 0) ? (
            <EmptyState icon={<SquareKanban />} title="The pipeline is empty">
              Move inquiries into the CRM, or add leads by hand.
            </EmptyState>
          ) : (
            <BarList
              valueLabel="Leads"
              rows={data.pipeline.map((stage) => ({ label: stage.label, value: stage.value, secondary: stage.total ? formatLKR(stage.total) : undefined }))}
            />
          )}
        </Panel>

        <Panel
          title="Follow-ups"
          description={
            summary.crm.follow_ups_overdue
              ? `${summary.crm.follow_ups_overdue} overdue · ${summary.crm.follow_ups_due} in the next 7 days`
              : `${summary.crm.follow_ups_due} in the next 7 days`
          }
          bodyClassName="px-0 pb-2 sm:px-0"
        >
          {data.followUps.length === 0 ? (
            <EmptyState icon={<CalendarClock />} title="Nothing due">
              Set a follow-up date on a lead and it will show here.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {data.followUps.map((lead) => {
                const overdue = lead.follow_up_on! < data.today;
                const due = lead.follow_up_on === data.today;
                return (
                  <li key={lead.id}>
                    <Link href={`/admin/crm?lead=${lead.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-tint sm:px-6">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-ink">{lead.name}</span>
                        {lead.interest && <span className="block truncate text-[13px] text-muted">{lead.interest}</span>}
                      </span>
                      <Badge tone={overdue ? "outline" : due ? "solid" : "soft"}>
                        {overdue ? "Overdue · " : due ? "Today" : ""}
                        {due ? "" : formatShortDate(`${lead.follow_up_on}T00:00:00+05:30`)}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Blog"
          description={`${summary.blog.published} published · ${summary.blog.scheduled} scheduled · ${summary.blog.drafts} drafts`}
          action={
            <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-deep hover:text-ink">
              All posts <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          }
          bodyClassName="px-0 pb-2 sm:px-0"
        >
          {data.posts.length === 0 ? (
            <EmptyState icon={<Newspaper />} title="No posts yet">
              Write the first article for the website’s blog.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {data.posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/admin/blog/${post.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-tint sm:px-6">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{post.title || "Untitled post"}</span>
                      <span className="block text-[13px] text-muted">
                        {post.status === "draft" ? `Draft · edited ${formatAgo(post.updated_at)}` : `${formatNumber(post.views)} views in this period`}
                      </span>
                    </span>
                    <Badge tone={post.state === "Draft" ? "muted" : post.state === "Scheduled" ? "soft" : "solid"}>{post.state}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
