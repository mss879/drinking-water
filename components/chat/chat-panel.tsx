"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { EllipsisVertical, Headset, LoaderCircle, Phone, SendHorizontal, SquarePen, X } from "lucide-react";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { track } from "@/lib/analytics";
import { readAttribution } from "@/lib/analytics/client";
import { cn } from "@/lib/cn";
import { telHref, whatsappHref } from "@/lib/contact";
import { readSavedChat, writeSavedChat, type SavedChat as Saved } from "@/lib/chat/saved";
import type { ChatWidgetConfig, PublicMessage, PublicState } from "@/lib/chat/types";

/**
 * The website chat (the floating button opens it): the conversation with LUSAKO's assistant, or with a team member
 * once someone takes over. The conversation lives on the server; this browser keeps only the chat's id and secret
 * (localStorage "lusako-chat"), so it carries on across pages and visits. Replies from the team arrive by polling
 * /api/chat, quickly while someone is waiting or a person is answering and not at all otherwise.
 */

const MAX_LENGTH = 1000;

/** Adds new messages, drops repeats (polls overlap on purpose) and keeps them in order. */
function merge(current: PublicMessage[], incoming: PublicMessage[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => a.at.localeCompare(b.at));
}

/** The LUSAKO droplet mark, in the current colour. */
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 57.8 56" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M57.8,28c0,17.154 -11.195,28 -28.9,28c-17.705,0 -28.9,-10.846 -28.9,-28c0,-17.154 11.195,-28 28.9,-28c17.705,0 28.9,10.846 28.9,28zM16.835,26.281c-3.694,5.659 -2.496,13.033 2.822,17.368c5.318,4.335 13.167,4.335 18.485,0c5.318,-4.335 6.517,-11.709 2.822,-17.368l-11.682,-17.895c-0.249,-0.546 -0.517,-0.546 -0.765,0z"
      />
    </svg>
  );
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function ChatPanel({
  id,
  config,
  open,
  onClose,
  onUnread,
}: {
  id: string;
  config: ChatWidgetConfig;
  open: boolean;
  onClose: () => void;
  /** Replies that arrived while the chat was closed. */
  onUnread: (count: number) => void;
}) {
  const titleId = useId();
  const [saved, setSaved] = useState<Saved | null>(() => readSavedChat());
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [state, setState] = useState<PublicState>(() => ({
    mode: saved?.mode ?? (config.ai ? "ai" : "team"),
    waiting: saved?.waiting ?? false,
    agentName: null,
  }));
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [loaded, setLoaded] = useState(!saved);

  const messagesRef = useRef<PublicMessage[]>([]);
  /** The newest message seen with the chat open (kept in the browser), so later replies count as new. */
  const seenRef = useRef(saved?.seen ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastActivity = useRef(0);
  const unread = useRef(0);
  const openRef = useRef(open);
  const pinned = useRef(true);

  useEffect(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    openRef.current = open;
    if (open) {
      unread.current = 0;
      onUnread(0);
    }
  }, [open, onUnread]);

  const remember = useCallback((next: Saved | null) => {
    setSaved(next);
    writeSavedChat(next);
  }, []);

  /** New replies from the server: shown, counted while closed, and the chat's state kept. */
  const receive = useCallback(
    (incoming: PublicMessage[], nextState: PublicState | undefined) => {
      const known = new Set(messagesRef.current.map((message) => message.id));
      const fresh = incoming.filter(
        (message) => !known.has(message.id) && (message.role === "assistant" || message.role === "agent") && message.at > seenRef.current,
      );
      if (fresh.length && !openRef.current) {
        unread.current += fresh.length;
        onUnread(unread.current);
      }
      if (incoming.length) setMessages((current) => merge(current, incoming));
      if (nextState) {
        setState(nextState);
        // Remember who's answering, so the button can check for a person's replies on the next visit.
        const current = readSavedChat();
        if (current && (current.mode !== nextState.mode || current.waiting !== nextState.waiting)) {
          remember({ ...current, mode: nextState.mode, waiting: nextState.waiting });
        }
      }
    },
    [onUnread, remember],
  );

  const fetchSince = useCallback(
    async (since: string | null) => {
      if (!saved) return;
      try {
        const response = await fetch(`/api/chat${since ? `?since=${encodeURIComponent(since)}` : ""}`, {
          headers: { "x-chat-session": saved.id, "x-chat-token": saved.token },
          cache: "no-store",
        });
        if (response.status === 404) {
          // The chat was deleted by the team, or this browser's secret no longer matches: start afresh.
          remember(null);
          setMessages([]);
          return;
        }
        if (!response.ok) return;
        const data = (await response.json()) as { messages: PublicMessage[]; state: PublicState };
        receive(data.messages, data.state);
      } catch {
        // Offline for a moment: the next poll catches up.
      } finally {
        setLoaded(true);
      }
    },
    [saved, receive, remember],
  );

  // The whole conversation, once, when this browser already has one.
  const fetched = useRef(false);
  useEffect(() => {
    if (!saved || fetched.current) return;
    fetched.current = true;
    void fetchSince(null);
  }, [saved, fetchSince]);

  // Polling: quickly while a person is answering or someone is waiting, slowly while the assistant answers (to notice
  // a team member joining), and only while this tab is visible.
  const lastAt = messages.at(-1)?.at ?? null;
  const lastAtRef = useRef(lastAt);
  useEffect(() => {
    lastAtRef.current = lastAt;
  }, [lastAt]);
  useEffect(() => {
    if (!saved) return;
    const live = state.mode === "human" || state.waiting;
    const every = open ? (live ? 3000 : 10_000) : live ? 15_000 : 0;
    if (!every) return;
    let stopped = false;
    let timer = 0;
    const tick = async () => {
      const idle = Date.now() - lastActivity.current > (live ? 60 : 15) * 60_000;
      if (document.visibilityState === "visible" && !idle) await fetchSince(lastAtRef.current);
      if (!stopped) timer = window.setTimeout(tick, every);
    };
    // Coming back to the tab: check straight away rather than at the next tick.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timer);
      void tick();
    };
    timer = window.setTimeout(tick, every);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [saved, open, state.mode, state.waiting, fetchSince]);

  // Keep the newest message in view, unless the visitor scrolled up to read. A long reply shows from its start.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !pinned.current) return;
    const last = list.querySelector<HTMLElement>("[data-message]:last-of-type");
    if (last && last.dataset.role !== "user" && last.offsetHeight > list.clientHeight * 0.6) {
      list.scrollTop = last.offsetTop - 12;
    } else {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages, sending, open, state.waiting]);

  // Opening: focus the message box on computers; on phones the chat covers the page, so the page stops scrolling.
  useEffect(() => {
    if (!open) return;
    pinned.current = true;
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    const phone = window.matchMedia("(max-width: 39.99rem)").matches;
    const root = document.documentElement;
    const previous = root.style.overflow;
    if (phone) root.style.overflow = "hidden";
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (phone) root.style.overflow = previous;
    };
  }, [open, onClose]);

  // With the chat open, everything shown has been seen.
  useEffect(() => {
    const last = messages.at(-1)?.at;
    if (!open || !last || last <= seenRef.current) return;
    seenRef.current = last;
    const current = readSavedChat();
    if (current) writeSavedChat({ ...current, seen: last });
  }, [open, messages]);

  const tracked = useRef(false);
  useEffect(() => {
    if (!open || tracked.current) return;
    tracked.current = true;
    track("chat_open");
  }, [open]);

  async function send(text: string, action?: "person") {
    const content = text.trim().slice(0, MAX_LENGTH);
    if ((!content && !action) || sending) return;
    lastActivity.current = Date.now();
    pinned.current = true;
    setNotice(null);
    setMenu(false);
    setSending(true);
    const temp: PublicMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: action === "person" ? "I’d like to talk to a person, please." : content,
      author: null,
      at: new Date().toISOString(),
    };
    setMessages((current) => [...current, temp]);
    if (!action) setDraft("");

    const attempt = () =>
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: saved?.id,
          token: saved?.token,
          message: content,
          ...(action && { action }),
          page: window.location.pathname,
          ...(!saved && { attribution: readAttribution() }),
        }),
      });

    try {
      let response = await attempt();
      // One quiet retry for a hiccup on the way (not for a refusal).
      if (response.status >= 500 && response.status !== 503) {
        await wait(1200);
        response = await attempt();
      }
      const data = (await response.json().catch(() => ({}))) as {
        sessionId?: string;
        token?: string;
        messages?: PublicMessage[];
        state?: PublicState;
        message?: string;
      };
      if (!response.ok || !data.messages) {
        setMessages((current) => current.filter((message) => message.id !== temp.id));
        if (!action) setDraft(content);
        setNotice(
          data.message ??
            (response.status === 503
              ? "The chat isn’t available right now. Please call or WhatsApp us instead."
              : "Sorry, your message didn’t go through. Please try again."),
        );
        return;
      }
      if (data.token && data.sessionId) {
        fetched.current = true;
        remember({ id: data.sessionId, token: data.token, mode: data.state?.mode, waiting: data.state?.waiting });
      }
      setMessages((current) => merge(current.filter((message) => message.id !== temp.id), data.messages ?? []));
      if (data.state) receive([], data.state);
    } catch {
      setMessages((current) => current.filter((message) => message.id !== temp.id));
      if (!action) setDraft(content);
      setNotice("You seem to be offline. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  // The message box grows with what's typed, up to about five lines.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
  }, [draft, open]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    }
  }

  function startOver() {
    remember(null);
    setMessages([]);
    setState({ mode: config.ai ? "ai" : "team", waiting: false, agentName: null });
    setNotice(null);
    setMenu(false);
    unread.current = 0;
    onUnread(0);
    inputRef.current?.focus();
  }

  const human = state.mode === "human";
  const status = human ? (
    "A person is answering"
  ) : state.waiting ? (
    "A team member will join soon"
  ) : state.mode === "ai" ? (
    <>
      AI assistant<span className="max-sm:hidden"> · replies instantly</span>
    </>
  ) : (
    "Our team replies here"
  );
  const showQuickReplies = loaded && messages.length === 0 && config.quickReplies.length > 0;
  // Close the chat on phones when a link opens a page of the website, so the page shows.
  const onNavigate = () => {
    if (window.matchMedia("(max-width: 39.99rem)").matches) onClose();
  };

  return (
    <section
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      aria-hidden={!open}
      inert={!open}
      data-lenis-prevent
      className={cn(
        "fixed z-[60] flex flex-col overflow-hidden bg-canvas text-ink transition-[opacity,transform,visibility] duration-300 ease-emph motion-reduce:transition-none",
        // Phones: the whole screen. Tablets: a window above the action bar. Computers: the corner.
        "inset-0 pt-[env(safe-area-inset-top)]",
        "sm:inset-auto sm:right-4 sm:bottom-[calc(var(--cta-bar-h)+0.75rem)] sm:h-[min(640px,calc(100dvh-var(--cta-bar-h)-var(--header-h)-2rem))] sm:w-[400px] sm:rounded-card sm:border sm:border-line sm:pt-0 sm:shadow-float",
        "lg:right-5 lg:bottom-5 lg:h-[min(680px,calc(100dvh-var(--header-h)-2.5rem))]",
        "origin-bottom-right",
        open ? "visible translate-y-0 scale-100 opacity-100" : "pointer-events-none invisible translate-y-3 scale-[0.97] opacity-0",
      )}
    >
      {/* Header */}
      <header data-surface="dark" className="relative flex items-center gap-3 bg-deep px-4 py-3.5 text-white sm:px-5">
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white/12">
          <Mark className="size-6 text-white" />
          <span
            aria-hidden
            className={cn("absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-deep", human || state.mode === "ai" ? "bg-mist" : "bg-white/40")}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate font-display text-[15px] leading-tight font-bold">
            {human ? state.agentName || "LUSAKO team" : config.name}
          </h2>
          <p className="truncate text-[12px] leading-snug text-white/75">{status}</p>
        </div>
        {!human && (
          <button
            type="button"
            onClick={() => void send("", "person")}
            disabled={sending || state.waiting}
            title="Talk to a person"
            aria-label="Talk to a person"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-white/85 transition-colors hover:bg-white/12 hover:text-white disabled:cursor-default disabled:opacity-40"
          >
            <Headset aria-hidden className="size-[18px]" />
          </button>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((value) => !value)}
            aria-expanded={menu}
            aria-haspopup="menu"
            aria-label="More options"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-white/85 transition-colors hover:bg-white/12 hover:text-white"
          >
            <EllipsisVertical aria-hidden className="size-[18px]" />
          </button>
          {menu && (
            <div
              role="menu"
              className="absolute top-11 right-0 z-10 w-56 overflow-hidden rounded-card-sm border border-line bg-white py-1.5 text-ink shadow-float"
            >
              {config.whatsapp && (
                <a
                  role="menuitem"
                  href={whatsappHref(config.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-tint"
                >
                  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className="size-4 text-deep">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp us
                </a>
              )}
              {config.phone && (
                <a
                  role="menuitem"
                  href={telHref(config.phone)}
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-tint"
                >
                  <Phone aria-hidden className="size-4 text-deep" />
                  Call {config.phone}
                </a>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={startOver}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium hover:bg-tint"
              >
                <SquarePen aria-hidden className="size-4 text-deep" />
                Start a new chat
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the chat"
          className="-mr-1.5 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-white/85 transition-colors hover:bg-white/12 hover:text-white"
        >
          <X aria-hidden className="size-5" />
        </button>
      </header>

      {/* Conversation */}
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        data-lenis-prevent
        onScroll={(event) => {
          const list = event.currentTarget;
          pinned.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
        }}
        onClick={() => menu && setMenu(false)}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5"
      >
        <ol className="flex flex-col gap-3">
          <Bubble role="assistant" author={config.name}>
            {config.greeting}
          </Bubble>
          {!loaded && (
            <li className="flex justify-center py-2" aria-label="Loading the conversation">
              <LoaderCircle aria-hidden className="size-5 animate-spin text-mist" />
            </li>
          )}
          {messages.map((message) =>
            message.role === "system" ? (
              <li key={message.id} data-message data-role="system" className="flex justify-center px-2">
                <p className="max-w-[90%] rounded-card-sm bg-tint-2 px-3.5 py-2 text-center text-[13px] leading-snug text-deep">{message.content}</p>
              </li>
            ) : (
              <Bubble
                key={message.id}
                role={message.role}
                author={message.author}
                pending={message.id.startsWith("pending-")}
                onNavigate={onNavigate}
              >
                {message.content}
              </Bubble>
            ),
          )}
          {sending && state.mode === "ai" && (
            <li data-message data-role="typing" className="flex items-end gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line">
                <Mark className="size-4 text-brand" />
              </span>
              <span className="flex h-9 items-center gap-1 rounded-[18px] rounded-bl-md border border-line bg-white px-3.5" aria-label="Typing">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="size-1.5 animate-bounce rounded-full bg-brand motion-reduce:animate-none"
                    style={{ animationDelay: `${dot * 140}ms` }}
                  />
                ))}
              </span>
            </li>
          )}
        </ol>

        {showQuickReplies && (
          <div className="mt-4 flex flex-wrap gap-2 pl-9">
            {config.quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => void send(reply)}
                disabled={sending}
                className="cursor-pointer rounded-full border border-deep/20 bg-white px-3.5 py-2 text-left text-[13px] leading-snug font-semibold text-deep transition-colors hover:border-deep hover:bg-tint disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message box */}
      <form onSubmit={onSubmit} className="border-t border-line bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-3">
        {notice && (
          <p role="alert" className="mb-2 flex items-start gap-2 px-1 text-[13px] leading-snug text-ink">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
            {notice}
          </p>
        )}
        <div className="flex items-end gap-2 rounded-[22px] border border-line bg-canvas py-1.5 pr-1.5 pl-4 transition-colors focus-within:border-deep focus-within:bg-white">
          <label htmlFor={`${id}-input`} className="sr-only">
            Your message
          </label>
          <textarea
            id={`${id}-input`}
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={MAX_LENGTH}
            placeholder={human ? "Write a message…" : "Ask about purifiers, renting, AMC…"}
            className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-base leading-snug text-ink outline-none placeholder:text-muted/70 sm:text-[14px]"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-deep text-white transition-[background-color,transform,opacity] duration-200 hover:bg-deep-hover active:scale-95 disabled:cursor-default disabled:opacity-35"
          >
            {sending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <SendHorizontal aria-hidden className="size-4" />}
          </button>
        </div>
        <p className="mt-2 px-1 text-[11px] leading-snug text-muted">
          {state.mode === "ai" ? "AI assistant: answers can be wrong, and our team confirms every quote. " : ""}
          Chats are saved so our team can follow up. Never share card or bank details.
        </p>
      </form>
    </section>
  );
}

function Bubble({
  role,
  author,
  pending = false,
  onNavigate,
  children,
}: {
  role: PublicMessage["role"];
  author: string | null;
  pending?: boolean;
  onNavigate?: () => void;
  children: string;
}) {
  if (role === "user") {
    return (
      <li data-message data-role="user" className="flex justify-end pl-10">
        <p
          className={cn(
            "rounded-[18px] rounded-br-md bg-deep px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-white [overflow-wrap:anywhere] transition-opacity",
            pending && "opacity-70",
          )}
        >
          {children}
        </p>
      </li>
    );
  }
  const agent = role === "agent";
  return (
    <li data-message data-role={role} className="flex items-end gap-2 pr-6 animate-fade-up motion-reduce:animate-none">
      <span
        aria-hidden
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold",
          agent ? "bg-deep text-white" : "bg-white ring-1 ring-line",
        )}
      >
        {agent ? (author?.trim()[0] ?? "L").toUpperCase() : <Mark className="size-4 text-brand" />}
      </span>
      <div className="min-w-0">
        {agent && author && <p className="mb-1 pl-1 text-[11px] font-semibold text-muted">{author === "LUSAKO team" ? author : `${author} · LUSAKO`}</p>}
        <div className="rounded-[18px] rounded-bl-md border border-line bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink [overflow-wrap:anywhere]">
          <ChatMarkdown text={children} onNavigate={onNavigate} />
        </div>
      </div>
    </li>
  );
}
