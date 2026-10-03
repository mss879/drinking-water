"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Inbox, Search, SquareKanban, Trash2 } from "lucide-react";
import {
  deleteInquiries,
  markInquiriesRead,
  moveInquiriesToCrm,
  setInquiryStatus,
} from "@/app/actions/admin/inquiries";
import { InquiryDetail } from "@/components/admin/inquiries/inquiry-detail";
import type { FieldOption } from "@/content/forms";
import { Badge, InquiryStatusBadge, inquiryStatuses } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/dialog";
import { Input, Select } from "@/components/admin/ui/field";
import { EmptyState } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatAgo, formatDateTime } from "@/lib/admin/format";
import { formTypeLabels } from "@/lib/admin/inquiries";
import type { ActionResult } from "@/lib/admin/auth";
import type { AnalyticsSession, Inquiry, InquiryStatus } from "@/lib/supabase/types";

export type InquiryRow = Pick<
  Inquiry,
  "id" | "reference" | "form_type" | "status" | "read_at" | "name" | "email" | "phone" | "company" | "location" | "message" | "created_at"
> & { lead_id: string | null };

export type InquiryDetailData = {
  inquiry: Inquiry;
  leadId: string | null;
  /** Product names, for labelling the model the visitor picked. */
  catalogue: FieldOption[];
  session: Pick<
    AnalyticsSession,
    "channel" | "referrer_host" | "entry_path" | "device" | "browser" | "os" | "country" | "city" | "geo_source" | "pageviews" | "started_at"
  > | null;
};

type Counts = Record<"all" | "unread" | InquiryStatus, number>;

const statusTabs: { value: string; label: string; count: keyof Counts }[] = [
  { value: "all", label: "All", count: "all" },
  { value: "unread", label: "Unread", count: "unread" },
  { value: "new", label: "New", count: "new" },
  { value: "in_progress", label: "In progress", count: "in_progress" },
  { value: "resolved", label: "Resolved", count: "resolved" },
  { value: "spam", label: "Spam", count: "spam" },
];

export function InquiriesView({
  rows,
  total,
  page,
  pageSize,
  filters,
  counts,
  detail,
}: {
  rows: InquiryRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: { status: string; type: string; q: string };
  counts: Counts;
  detail: InquiryDetailData | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // A selection belongs to one page of results: once the rows change it starts again empty.
  const rowKey = rows.map((row) => row.id).join();
  const [selection, setSelection] = useState<{ key: string; ids: Set<string> }>({ key: rowKey, ids: new Set() });
  const selected = selection.key === rowKey ? selection.ids : new Set<string>();
  const setSelected = (next: Set<string> | ((current: Set<string>) => Set<string>)) =>
    setSelection((current) => ({
      key: rowKey,
      ids: typeof next === "function" ? next(current.key === rowKey ? current.ids : new Set()) : next,
    }));
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = useMemo(
    () => (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "" || value === "all") next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  function run(action: () => Promise<ActionResult<unknown>>, after?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (result.message) toast(result.message);
        after?.();
        router.refresh();
      } else toast(result.error, "error");
    });
  }

  const ids = [...selected];
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid gap-4">
      {/* Filters */}
      <div className="card-line flex flex-col gap-4 p-4 sm:p-5">
        <nav aria-label="Filter by status" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {statusTabs.map((tab) => {
            const active = filters.status === tab.value;
            return (
              <Link
                key={tab.value}
                href={href({ status: tab.value, page: null, id: null })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors",
                  active ? "bg-deep text-white" : "bg-tint text-ink hover:bg-tint-2",
                )}
              >
                {tab.label}
                <span className={cn("tabular-nums", active ? "text-white/80" : "text-muted")}>{counts[tab.count]}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-3 sm:flex-row">
          <form
            role="search"
            className="relative flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              const q = String(new FormData(event.currentTarget).get("q") ?? "");
              router.push(href({ q, page: null, id: null }));
            }}
          >
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <Input
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="Search name, phone, email, company or reference"
              aria-label="Search inquiries"
              className="pl-10"
            />
          </form>
          <Select
            aria-label="Form"
            value={filters.type}
            onChange={(event) => router.push(href({ type: event.target.value, page: null, id: null }))}
            className="sm:w-48"
          >
            <option value="all">All forms</option>
            {Object.entries(formTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="sticky top-16 z-30 flex flex-wrap items-center gap-2 rounded-card-sm bg-ink p-2.5 pl-4 text-white shadow-float lg:top-4" data-surface="dark">
          <span className="mr-auto text-sm font-semibold">{selected.size} selected</span>
          <Button size="sm" variant="glass" disabled={pending} onClick={() => run(() => markInquiriesRead(ids))}>
            Mark read
          </Button>
          <Select
            aria-label="Set status"
            value=""
            disabled={pending}
            onChange={(event) => {
              const status = event.target.value as InquiryStatus;
              if (status) run(() => setInquiryStatus(ids, status));
            }}
            className="h-10 w-40 border-white/30 bg-white/10 text-sm text-white"
          >
            <option value="">Set status…</option>
            {Object.entries(inquiryStatuses).map(([value, { label }]) => (
              <option key={value} value={value} className="text-ink">
                {label}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="white" disabled={pending} onClick={() => run(() => moveInquiriesToCrm(ids), () => setSelected(new Set()))}>
            <SquareKanban aria-hidden className="size-4" />
            Move to CRM
          </Button>
          <Button size="sm" variant="glass" disabled={pending} onClick={() => setConfirmDelete(true)} aria-label="Delete selected">
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </div>
      )}

      {/* List */}
      <div className="card-line overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<Inbox />} title={filters.q || filters.status !== "all" || filters.type !== "all" ? "No matches" : "No inquiries yet"}>
            {filters.q || filters.status !== "all" || filters.type !== "all"
              ? "Try another filter or search."
              : "Requests sent through the website’s forms will appear here as they arrive."}
          </EmptyState>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-line px-4 py-3 text-[13px] text-muted sm:px-5">
              <input
                type="checkbox"
                aria-label="Select all on this page"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)))}
                className="size-4 cursor-pointer accent-deep"
              />
              <span>
                {total} {total === 1 ? "inquiry" : "inquiries"}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {rows.map((row) => {
                const unread = !row.read_at;
                return (
                  <li key={row.id} className={cn("group relative flex items-start gap-3 px-4 py-4 transition-colors hover:bg-tint sm:px-5", selected.has(row.id) && "bg-tint")}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.name}`}
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                      className="relative z-10 mt-1 size-4 shrink-0 cursor-pointer accent-deep"
                    />
                    <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                      <div className="min-w-0">
                        <Link
                          href={href({ id: row.id })}
                          scroll={false}
                          className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-deep"
                        >
                          <span className={cn("flex items-center gap-2 truncate text-[15px]", unread ? "font-bold text-ink" : "font-medium text-ink")}>
                            {unread && <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand" />}
                            <span className="truncate">{row.name}</span>
                            {unread && <span className="sr-only">(unread)</span>}
                          </span>
                        </Link>
                        <p className="mt-0.5 truncate text-sm text-muted">
                          {[row.company, row.location].filter(Boolean).join(" · ") || row.phone || row.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="white">{formTypeLabels[row.form_type]}</Badge>
                        <InquiryStatusBadge status={row.status} />
                        {row.lead_id && (
                          <Badge tone="soft">
                            <SquareKanban aria-hidden className="size-3" />
                            In CRM
                          </Badge>
                        )}
                      </div>
                      <time dateTime={row.created_at} title={formatDateTime(row.created_at)} className="text-[13px] text-muted tabular-nums sm:text-right">
                        {formatAgo(row.created_at)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Link
              aria-disabled={page <= 1}
              href={href({ page: String(page - 1), id: null })}
              className={cn(buttonish, page <= 1 && "pointer-events-none opacity-40")}
            >
              <ChevronLeft aria-hidden className="size-4" /> Newer
            </Link>
            <Link
              aria-disabled={page >= pages}
              href={href({ page: String(page + 1), id: null })}
              className={cn(buttonish, page >= pages && "pointer-events-none opacity-40")}
            >
              Older <ChevronRight aria-hidden className="size-4" />
            </Link>
          </div>
        </nav>
      )}

      {detail && <InquiryDetail key={detail.inquiry.id} data={detail} onClose={() => router.push(href({ id: null }), { scroll: false })} />}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        pending={pending}
        title={`Delete ${selected.size} ${selected.size === 1 ? "inquiry" : "inquiries"}?`}
        description="They will be removed for good. Leads already moved into the CRM stay there."
        onConfirm={() =>
          run(
            () => deleteInquiries(ids),
            () => {
              setConfirmDelete(false);
              setSelected(new Set());
            },
          )
        }
      />
    </div>
  );
}

const buttonish =
  "inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 font-semibold text-deep transition-colors hover:border-deep";
