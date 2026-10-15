"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { Bot, ChevronLeft, ChevronRight, MessagesSquare, Search, TriangleAlert } from "lucide-react";
import { ChatStatusBadges, type AssistantStatus, type ChatCounts, type ChatRow, type ChatView, type OpenChat } from "@/components/admin/chats/chat-badges";
import { ChatConversation } from "@/components/admin/chats/chat-conversation";
import { Input } from "@/components/admin/ui/field";
import { EmptyState } from "@/components/admin/ui/panel";
import { cn } from "@/lib/cn";
import { formatAgo, formatDateTime } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type { AssistantStatus, ChatCounts, ChatRow, ChatView, OpenChat };

const viewTabs: { value: ChatView; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "attention", label: "Needs you" },
  { value: "live", label: "Taken over" },
  { value: "leads", label: "Leads" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

/**
 * Live updates: Supabase Realtime tells the inbox when a chat or message changes (row level security limits it to
 * admins), and the page refreshes its data. A slow poll covers projects without Realtime.
 */
function useLiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    let timer = 0;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => router.refresh(), 600);
    };
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 20_000);
    if (!isSupabaseConfigured()) return () => window.clearInterval(poll);
    const supabase = createClient();
    const channel = supabase
      .channel("admin-chats-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, refresh)
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [router]);
}

export function ChatsInbox({
  rows,
  total,
  page,
  pageSize,
  filters,
  counts,
  open,
  assistant,
  me,
}: {
  rows: ChatRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: { view: ChatView; q: string };
  counts: ChatCounts;
  open: OpenChat | null;
  assistant: AssistantStatus;
  me: { email: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const searchRef = useRef<HTMLInputElement>(null);
  useLiveRefresh();

  const href = useMemo(
    () => (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "" || (key === "view" && value === "open")) next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  return (
    <div className="grid gap-4">
      {/* The assistant's state, when it needs attention */}
      {(assistant.keyMissing || !assistant.on || !assistant.widget) && (
        <div className="flex items-start gap-3 rounded-card-sm border border-line bg-white p-4 text-sm leading-relaxed text-ink">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-deep" />
          <p>
            {!assistant.widget
              ? "The chat button is switched off, so visitors can’t start chats. "
              : assistant.keyMissing
                ? "The assistant is switched on but the OpenAI key (OPENAI_API_KEY) isn’t set, so the chat button is hidden on the website. "
                : "The assistant is switched off: visitors can still chat, and every new chat waits for the team. "}
            <Link href="/admin/chats/settings" className="font-semibold text-deep underline underline-offset-2">
              Assistant settings
            </Link>
          </p>
        </div>
      )}

      <div className="card-line flex flex-col gap-4 p-4 sm:p-5">
        <nav aria-label="Filter chats" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {viewTabs.map((tab) => {
            const active = filters.view === tab.value;
            return (
              <Link
                key={tab.value}
                href={href({ view: tab.value, page: null, id: null })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors",
                  active ? "bg-deep text-white" : "bg-tint text-ink hover:bg-tint-2",
                )}
              >
                {tab.label}
                <span className={cn("tabular-nums", active ? "text-white/80" : "text-muted")}>{counts[tab.value]}</span>
              </Link>
            );
          })}
        </nav>
        <form
          role="search"
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(href({ q: searchRef.current?.value ?? "", page: null, id: null }));
          }}
        >
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <Input
            ref={searchRef}
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search name, phone, email, company, location or what they said"
            aria-label="Search chats"
            className="pl-10"
          />
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
        {/* The list (hidden on phones while a chat is open) */}
        <div className={cn("card-line overflow-hidden lg:sticky lg:top-6", open && "hidden lg:block")}>
          {rows.length === 0 ? (
            <EmptyState icon={<MessagesSquare />} title={filters.q || filters.view !== "open" ? "No chats here" : "No chats yet"}>
              {filters.q || filters.view !== "open"
                ? "Try another filter or search."
                : "Conversations from the website’s chat appear here as they happen."}
            </EmptyState>
          ) : (
            <ul className="max-h-[calc(100dvh-16rem)] divide-y divide-line overflow-y-auto">
              {rows.map((row) => {
                const selected = open?.session.id === row.id;
                const context = (row.context ?? {}) as Record<string, string | null>;
                const who = [row.phone, row.location ?? context.city].filter(Boolean).join(" · ");
                return (
                  <li key={row.id} className={cn("relative transition-colors hover:bg-tint", selected && "bg-tint-2 hover:bg-tint-2")}>
                    <Link
                      href={href({ id: row.id })}
                      scroll={false}
                      aria-current={selected ? "true" : undefined}
                      className="block px-4 py-3.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-deep sm:px-5"
                    >
                      <div className="flex items-center gap-2">
                        {row.admin_unread && <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand" />}
                        <span className={cn("min-w-0 flex-1 truncate text-[15px] text-ink", row.admin_unread ? "font-bold" : "font-medium")}>
                          {row.visitor_name || "Website visitor"}
                          {row.admin_unread && <span className="sr-only"> (new messages)</span>}
                        </span>
                        <time dateTime={row.last_message_at} title={formatDateTime(row.last_message_at)} className="shrink-0 text-[12px] text-muted tabular-nums">
                          {formatAgo(row.last_message_at)}
                        </time>
                      </div>
                      {who && <p className="mt-0.5 truncate text-[13px] text-muted">{who}</p>}
                      {row.last_message_preview && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink/80">{row.last_message_preview}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <ChatStatusBadges chat={row} />
                        {row.ai_enabled && !row.handover_requested_at && row.status === "open" && (
                          <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                            <Bot aria-hidden className="size-3.5" />
                            Assistant
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {pages > 1 && (
            <nav aria-label="Pages" className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 text-[13px] sm:px-5">
              <span className="text-muted">
                {page} of {pages}
              </span>
              <div className="flex gap-1.5">
                <Link
                  aria-disabled={page <= 1}
                  aria-label="Newer chats"
                  href={href({ page: String(page - 1), id: null })}
                  className={cn(pageButton, page <= 1 && "pointer-events-none opacity-40")}
                >
                  <ChevronLeft aria-hidden className="size-4" />
                </Link>
                <Link
                  aria-disabled={page >= pages}
                  aria-label="Older chats"
                  href={href({ page: String(page + 1), id: null })}
                  className={cn(pageButton, page >= pages && "pointer-events-none opacity-40")}
                >
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              </div>
            </nav>
          )}
        </div>

        {/* The conversation */}
        {open ? (
          <ChatConversation key={open.session.id} chat={open} me={me} onBack={() => router.push(href({ id: null }), { scroll: false })} />
        ) : (
          <div className="card-line hidden lg:block">
            <EmptyState icon={<MessagesSquare />} title="Choose a chat">
              Open a conversation to read it, see what the visitor wants and what the assistant quoted, and take it over if you’d like to answer
              yourself.
            </EmptyState>
          </div>
        )}
      </div>
    </div>
  );
}

const pageButton = "grid size-9 place-items-center rounded-full border border-line bg-white text-deep transition-colors hover:border-deep";
