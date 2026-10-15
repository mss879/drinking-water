"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import {
  Bot,
  Calculator,
  ChevronLeft,
  CircleAlert,
  Headset,
  Mail,
  MailCheck,
  MessageCircle,
  Pencil,
  Phone,
  RotateCcw,
  SendHorizontal,
  SquareKanban,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  addChatToCrm,
  deleteChats,
  dismissChatRequest,
  handBackChat,
  markChatRead,
  saveChatVisitor,
  sendChatReply,
  setChatsStatus,
  takeOverChat,
} from "@/app/actions/admin/chats";
import { useAgentName } from "@/components/admin/chats/agent-name";
import { ChatStatusBadges, type OpenChat } from "@/components/admin/chats/chat-badges";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Input } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button, buttonClasses } from "@/components/ui/button";
import { formatAgo, formatDateTime, whatsappNumber } from "@/lib/admin/format";
import { priceText, quoteFrom, quoteTotals } from "@/lib/chat/quote";
import type { ActionResult } from "@/lib/admin/auth";
import type { ChatMessage } from "@/lib/supabase/types";

const timeOnly = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", hour: "numeric", minute: "2-digit", hour12: true });

type ToolEvent =
  | { type: "quote"; lines: string[]; totals: string[] }
  | { type: "lead"; leadId: string; created: boolean }
  | { type: "lead_failed"; reason: string }
  | { type: "email"; sent: boolean; reason?: string }
  | { type: "human"; reason: string };

type Meta = { model?: string; ms?: number; usage?: { input: number | null; output: number | null }; events?: ToolEvent[]; error?: string };

const labels: Record<string, string> = {
  need: "Wants",
  customerType: "Customer",
  units: "Units",
  people: "People",
  waterSource: "Water",
  timeline: "When",
  priority: "Priority",
};
const values: Record<string, Record<string, string>> = {
  need: { buy: "To buy", rent: "To rent", corporate: "Corporate hydration", amc: "An AMC", service: "Service", parts: "Filters or parts", not_sure: "Not sure yet" },
  customerType: { home: "Home", office: "Office", organisation: "Organisation" },
  waterSource: { city: "City (mains) water", well: "Well water", other: "Other", unknown: "Not known" },
  priority: { high: "High", medium: "Medium", low: "Low" },
};

/** What the assistant did for a reply: quotes, saved leads, emails, requests for a person. */
function ToolChips({ meta }: { meta: Meta }) {
  const events = meta.events ?? [];
  if (!events.length && !meta.error) return null;
  return (
    <div className="mt-1.5 flex max-w-full flex-col items-end gap-1.5">
      {events.map((event, i) => {
        if (event.type === "quote") {
          return (
            <details key={i} className="group max-w-full rounded-card-sm border border-line bg-white px-3 py-2 text-[12px] text-ink">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold text-deep">
                <Calculator aria-hidden className="size-3.5" />
                Quote{event.totals.length ? `: ${event.totals.join(", ")}` : ""}
              </summary>
              <ul className="mt-1.5 grid gap-0.5 text-muted">
                {event.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          );
        }
        if (event.type === "lead") {
          return (
            <Link
              key={i}
              href={`/admin/crm?lead=${event.leadId}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold text-deep hover:border-deep"
            >
              <SquareKanban aria-hidden className="size-3.5" />
              {event.created ? "Saved to the CRM" : "Lead updated"}
            </Link>
          );
        }
        const chip = (icon: ReactNode, text: string) => (
          <span key={i} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-ink">
            {icon}
            <span className="truncate">{text}</span>
          </span>
        );
        if (event.type === "human") return chip(<Headset aria-hidden className="size-3.5 text-deep" />, `Asked for a person: ${event.reason}`);
        if (event.type === "email") return chip(event.sent ? <MailCheck aria-hidden className="size-3.5 text-deep" /> : <Mail aria-hidden className="size-3.5 text-muted" />, event.sent ? "Quote emailed" : "Quote email not sent");
        return chip(<CircleAlert aria-hidden className="size-3.5 text-muted" />, "The lead couldn’t be saved");
      })}
      {meta.error && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-ink">
          <CircleAlert aria-hidden className="size-3.5 text-muted" />
          The assistant had a problem and sent a holding reply
        </span>
      )}
    </div>
  );
}

function Message({ message }: { message: ChatMessage }) {
  const at = (
    <time dateTime={message.created_at} title={formatDateTime(message.created_at)}>
      {timeOnly.format(new Date(message.created_at))}
    </time>
  );
  if (message.role === "system") {
    return (
      <li className="flex justify-center">
        <span className="max-w-[90%] rounded-full bg-tint px-3.5 py-1.5 text-center text-[12px] text-muted">
          {message.content} · {at}
        </span>
      </li>
    );
  }
  if (message.role === "user") {
    return (
      <li className="flex flex-col items-start pr-8 sm:pr-16">
        <span className="mb-1 flex items-center gap-1.5 pl-1 text-[12px] text-muted">
          <UserRound aria-hidden className="size-3.5" />
          Visitor · {at}
        </span>
        <p className="rounded-[18px] rounded-tl-md border border-line bg-white px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-ink [overflow-wrap:anywhere]">
          {message.content}
        </p>
      </li>
    );
  }
  const meta = (message.meta ?? {}) as Meta;
  const agent = message.role === "agent";
  const details = !agent && meta.model ? `${meta.model}${meta.ms ? ` · ${(meta.ms / 1000).toFixed(1)}s` : ""}${meta.usage?.input ? ` · ${meta.usage.input + (meta.usage.output ?? 0)} tokens` : ""}` : undefined;
  return (
    <li className="flex flex-col items-end pl-8 sm:pl-16">
      <span className="mb-1 flex items-center gap-1.5 pr-1 text-[12px] text-muted" title={details}>
        {agent ? <Headset aria-hidden className="size-3.5" /> : <Bot aria-hidden className="size-3.5" />}
        {agent ? message.author_name || "LUSAKO team" : "Assistant"} · {at}
      </span>
      {agent ? (
        <p className="rounded-[18px] rounded-tr-md bg-deep px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-white [overflow-wrap:anywhere]">
          {message.content}
        </p>
      ) : (
        <div className="max-w-full rounded-[18px] rounded-tr-md bg-tint-2 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink [overflow-wrap:anywhere]">
          <ChatMarkdown text={message.content} />
        </div>
      )}
      {!agent && <ToolChips meta={meta} />}
    </li>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-1.5 text-[13px]">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 font-medium break-words text-ink">{children}</dd>
    </div>
  );
}

/** Everything known about the visitor: details, what they want, the quote, where they came from. */
function VisitorPanel({ chat, onEdit, onCrm, pending }: { chat: OpenChat; onEdit: () => void; onCrm: () => void; pending: boolean }) {
  const { session, lead } = chat;
  const profile = (session.profile ?? {}) as Record<string, unknown>;
  const context = (session.context ?? {}) as Record<string, string | null>;
  const utm = (session.utm ?? {}) as Record<string, string>;
  const quote = quoteFrom(profile.quote);
  const wa = whatsappNumber(session.phone);
  const wants = Object.keys(labels)
    .map((key) => {
      const raw = profile[key];
      if (raw === undefined || raw === null || raw === "") return null;
      const text = typeof raw === "string" ? (values[key]?.[raw] ?? raw) : Array.isArray(raw) ? raw.join(", ") : String(raw);
      return { label: labels[key], text };
    })
    .filter((item): item is { label: string; text: string } => item !== null);
  const products = Array.isArray(profile.products) ? (profile.products as string[]) : [];

  return (
    <div className="grid gap-5">
      <section>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[15px] font-bold text-ink">Visitor</h3>
          <button type="button" onClick={onEdit} className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-deep hover:underline">
            <Pencil aria-hidden className="size-3.5" />
            Edit
          </button>
        </div>
        <dl className="mt-2">
          <Row label="Name">{session.visitor_name || "—"}</Row>
          <Row label="Phone">{session.phone || "—"}</Row>
          <Row label="Email">{session.email || "—"}</Row>
          {session.company && <Row label="Company">{session.company}</Row>}
          <Row label="Location">{session.location || context.city || "—"}</Row>
        </dl>
        {(session.phone || session.email) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {session.phone && (
              <a href={`tel:${session.phone.replace(/\s/g, "")}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
                <Phone aria-hidden className="size-4" />
                Call
              </a>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
                <MessageCircle aria-hidden className="size-4" />
                WhatsApp
              </a>
            )}
            {session.email && (
              <a href={`mailto:${session.email}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
                <Mail aria-hidden className="size-4" />
                Email
              </a>
            )}
          </div>
        )}
      </section>

      <section className="border-t border-line pt-4">
        <h3 className="font-display text-[15px] font-bold text-ink">CRM</h3>
        {lead ? (
          <div className="mt-2 grid gap-2">
            <p className="text-[13px] text-ink">
              <span className="font-semibold">{lead.name}</span>
              {lead.stage ? <span className="text-muted"> · {lead.stage}</span> : null}
            </p>
            <Link href={`/admin/crm?lead=${lead.id}`} className={buttonClasses({ variant: "outline", size: "sm", className: "justify-self-start" })}>
              <SquareKanban aria-hidden className="size-4" />
              Open in the CRM
            </Link>
          </div>
        ) : (
          <div className="mt-2 grid gap-2">
            <p className="text-[13px] leading-relaxed text-muted">
              Not in the CRM yet. The assistant adds visitors once it has their name, contact details, need and location.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onCrm} disabled={pending} className="justify-self-start">
              <SquareKanban aria-hidden className="size-4" />
              Add to the CRM
            </Button>
          </div>
        )}
      </section>

      {(wants.length > 0 || products.length > 0 || session.summary) && (
        <section className="border-t border-line pt-4">
          <h3 className="font-display text-[15px] font-bold text-ink">What they want</h3>
          <dl className="mt-2">
            {typeof profile.interest === "string" && <Row label="Interest">{profile.interest}</Row>}
            {wants.map((item) => (
              <Row key={item.label} label={item.label}>
                {item.text}
              </Row>
            ))}
            {products.length > 0 && <Row label="Products">{products.join(", ")}</Row>}
          </dl>
          {session.summary && (
            <p className="mt-2 rounded-card-sm bg-tint p-3 text-[13px] leading-relaxed text-ink">
              <span className="mb-1 block text-[12px] font-semibold text-muted">The assistant’s note</span>
              {session.summary}
            </p>
          )}
        </section>
      )}

      {quote && (
        <section className="border-t border-line pt-4">
          <h3 className="font-display text-[15px] font-bold text-ink">Latest quote</h3>
          <ul className="mt-2 grid gap-1.5 text-[13px]">
            {quote.lines.map((line, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="min-w-0 text-ink">
                  {line.alternative ? "Option: " : ""}
                  {line.label}
                  <span className="block text-[12px] text-muted">{line.detail}</span>
                </span>
                <span className="shrink-0 font-semibold text-ink">{priceText(line.amount)}</span>
              </li>
            ))}
          </ul>
          {quoteTotals(quote).length > 0 && (
            <p className="mt-2 border-t border-line pt-2 text-right text-[13px] font-bold text-deep">{quoteTotals(quote).join(" · ")}</p>
          )}
        </section>
      )}

      <section className="border-t border-line pt-4">
        <h3 className="font-display text-[15px] font-bold text-ink">Visit</h3>
        <dl className="mt-2">
          <Row label="Started">{formatDateTime(session.created_at)}</Row>
          {session.page_path && <Row label="On page">{session.page_path}</Row>}
          {(utm.utm_source || session.referrer) && <Row label="Came from">{utm.utm_source ? `${utm.utm_source}${utm.utm_campaign ? ` · ${utm.utm_campaign}` : ""}` : session.referrer}</Row>}
          {(context.device || context.browser) && (
            <Row label="Device">{[context.device, context.browser, context.os].filter(Boolean).join(" · ")}</Row>
          )}
          {(context.city || context.country) && <Row label="Location">{[context.city, context.country].filter(Boolean).join(", ")}</Row>}
          <Row label="Messages">{session.message_count}</Row>
        </dl>
      </section>
    </div>
  );
}

/** One chat: the whole conversation, who's answering, and everything the team can do with it. */
export function ChatConversation({ chat, me, onBack }: { chat: OpenChat; me: { email: string }; onBack: () => void }) {
  const { session, messages } = chat;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useAgentName(me.email);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<ChatMessage[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [askName, setAskName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const markedRead = useRef(false);

  const all = useMemo(() => {
    const byId = new Map(messages.map((message) => [message.id, message]));
    for (const message of sent) if (!byId.has(message.id)) byId.set(message.id, message);
    return [...byId.values()].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  }, [messages, sent]);

  // Opening a chat with new messages marks it read.
  useEffect(() => {
    if (!session.admin_unread || markedRead.current) return;
    markedRead.current = true;
    void markChatRead(session.id).then((result) => {
      if (result.ok) router.refresh();
    });
  }, [session.id, session.admin_unread, router]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [all.length]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  }, [draft]);

  function run<T>(action: () => Promise<ActionResult<T>>, done?: (result: ActionResult<T>) => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (result.message) toast(result.message);
        done?.(result);
        router.refresh();
      } else toast(result.error, "error");
    });
  }

  function send() {
    const text = draft.trim();
    if (!text || pending) return;
    run(
      () => sendChatReply(session.id, text, name),
      (result) => {
        setDraft("");
        if (result.ok && result.data) setSent((current) => [...current, result.data!]);
      },
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  const live = !session.ai_enabled;
  const waiting = Boolean(session.handover_requested_at) && session.ai_enabled;
  const context = (session.context ?? {}) as Record<string, string | null>;
  const subtitle = [session.phone, session.email, session.location ?? context.city].filter(Boolean).join(" · ");
  const panel = (
    <VisitorPanel chat={chat} onEdit={() => setEditing(true)} onCrm={() => run(() => addChatToCrm(session.id))} pending={pending} />
  );

  return (
    <div className="card-line flex min-w-0 flex-col overflow-hidden lg:h-[calc(100dvh-13.5rem)] lg:min-h-[34rem] xl:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-line px-4 py-3.5 sm:px-5">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to the chats"
              className="-ml-1.5 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-deep hover:bg-tint lg:hidden"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg leading-tight font-bold text-ink">{session.visitor_name || "Website visitor"}</h2>
              <p className="mt-0.5 truncate text-[13px] text-muted">{subtitle || `Started ${formatAgo(session.created_at)}`}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ChatStatusBadges chat={session} />
                {session.ai_enabled && !waiting && (
                  <Badgeish>
                    <Bot aria-hidden className="size-3" />
                    Assistant answering
                  </Badgeish>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete this chat"
              title="Delete this chat"
              className="-mr-1.5 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-tint hover:text-ink"
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {live ? (
              <Button type="button" size="sm" variant="outline" onClick={() => run(() => handBackChat(session.id))} disabled={pending}>
                <Bot aria-hidden className="size-4" />
                Hand back to the assistant
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={() => run(() => takeOverChat(session.id, name), () => inputRef.current?.focus())} disabled={pending}>
                <Headset aria-hidden className="size-4" />
                Take over
              </Button>
            )}
            {waiting && (
              <Button type="button" size="sm" variant="ghost" onClick={() => run(() => dismissChatRequest(session.id))} disabled={pending}>
                Mark as handled
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => run(() => setChatsStatus([session.id], session.status === "open" ? "closed" : "open"))}
              disabled={pending}
            >
              {session.status === "open" ? (
                "Close chat"
              ) : (
                <>
                  <RotateCcw aria-hidden className="size-4" />
                  Reopen
                </>
              )}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
            aria-expanded={showDetails}
            className="mt-3 w-full cursor-pointer rounded-full bg-tint py-2 text-[13px] font-semibold text-deep xl:hidden"
          >
            {showDetails ? "Hide visitor details" : "Visitor details, quote and CRM"}
          </button>
        </header>

        {showDetails && <div className="border-b border-line px-4 py-4 sm:px-5 xl:hidden">{panel}</div>}

        {waiting && (
          <p className="flex items-start gap-2 border-b border-line bg-tint px-4 py-2.5 text-[13px] leading-snug text-ink sm:px-5">
            <Headset aria-hidden className="mt-0.5 size-4 shrink-0 text-deep" />
            <span>
              This visitor asked for a person{session.handover_reason ? ` (${session.handover_reason})` : ""} {formatAgo(session.handover_requested_at)}. Take over to
              reply here; the assistant keeps helping until you do.
            </span>
          </p>
        )}

        {/* Transcript */}
        <div ref={listRef} className="min-h-[18rem] flex-1 overflow-y-auto bg-canvas px-4 py-5 sm:px-6">
          <ol className="flex flex-col gap-4">
            {all.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </ol>
        </div>

        {/* Reply */}
        <div className="border-t border-line bg-white px-4 pt-3 pb-4 sm:px-5">
          {!live && (
            <p className="mb-2 text-[12px] text-muted">The assistant is answering. Sending a message takes the chat over, and the assistant stops replying in it.</p>
          )}
          <div className="flex items-end gap-2 rounded-[22px] border border-line bg-canvas py-1.5 pr-1.5 pl-4 transition-colors focus-within:border-deep focus-within:bg-white">
            <label htmlFor={`reply-${session.id}`} className="sr-only">
              Reply to the visitor
            </label>
            <textarea
              id={`reply-${session.id}`}
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={`Reply as ${name}…`}
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-base leading-snug text-ink outline-none placeholder:text-muted/70 sm:text-[14px]"
            />
            <button
              type="button"
              onClick={send}
              disabled={pending || !draft.trim()}
              aria-label="Send"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-deep text-white transition-colors hover:bg-deep-hover disabled:cursor-default disabled:opacity-35"
            >
              <SendHorizontal aria-hidden className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-[12px] text-muted">
            The visitor sees you as <span className="font-semibold text-ink">{name}</span>.{" "}
            <button
              type="button"
              onClick={() => {
                setNameDraft(name);
                setAskName(true);
              }}
              className="cursor-pointer font-semibold text-deep hover:underline"
            >
              Change
            </button>
          </p>
        </div>
      </div>

      {/* Details beside the conversation on wide screens */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-line px-5 py-5 xl:block">{panel}</aside>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        pending={pending}
        title="Delete this chat?"
        description="The conversation is removed for good. If the visitor is in the CRM, their lead stays there."
        onConfirm={() =>
          run(
            () => deleteChats([session.id]),
            () => {
              setConfirmDelete(false);
              onBack();
            },
          )
        }
      />

      <Dialog open={askName} onClose={() => setAskName(false)} title="Your name in chats">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setName(nameDraft.trim() || "LUSAKO team");
            setAskName(false);
          }}
          className="grid gap-4"
        >
          <Field label="Name the visitor sees" htmlFor="agent-name" hint="Saved on this computer. Use “LUSAKO team” to stay anonymous.">
            <Input id="agent-name" value={nameDraft} onChange={(event) => setNameDraft(event.target.value.slice(0, 40))} autoFocus />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAskName(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Dialog>

      {editing && <VisitorEditor chat={chat} onClose={() => setEditing(false)} />}
    </div>
  );
}

function Badgeish({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-6 items-center gap-1 rounded-full bg-ink/5 px-2.5 text-xs font-semibold text-muted">{children}</span>;
}

function VisitorEditor({ chat, onClose }: { chat: OpenChat; onClose: () => void }) {
  const { session } = chat;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({
    name: session.visitor_name ?? "",
    phone: session.phone ?? "",
    email: session.email ?? "",
    company: session.company ?? "",
    location: session.location ?? "",
  });
  const set = (key: keyof typeof draft) => (event: ChangeEvent<HTMLInputElement>) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  return (
    <Dialog open onClose={onClose} title="Visitor details" description="What the visitor told you, so the team can follow up.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await saveChatVisitor(session.id, draft);
            if (!result.ok) return toast(result.error, "error");
            toast(result.message ?? "Saved.");
            onClose();
            router.refresh();
          });
        }}
      >
        <Field label="Name" htmlFor="visitor-name">
          <Input id="visitor-name" value={draft.name} onChange={set("name")} autoComplete="off" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="visitor-phone">
            <Input id="visitor-phone" value={draft.phone} onChange={set("phone")} inputMode="tel" autoComplete="off" />
          </Field>
          <Field label="Email" htmlFor="visitor-email">
            <Input id="visitor-email" value={draft.email} onChange={set("email")} inputMode="email" autoComplete="off" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="visitor-company">
            <Input id="visitor-company" value={draft.company} onChange={set("company")} autoComplete="off" />
          </Field>
          <Field label="Location" htmlFor="visitor-location">
            <Input id="visitor-location" value={draft.location} onChange={set("location")} autoComplete="off" />
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
