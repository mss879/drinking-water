"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { MessageCircleMore, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { parseSavedChat, savedChatSnapshot, subscribeSavedChat } from "@/lib/chat/saved";
import type { ChatWidgetConfig } from "@/lib/chat/types";

/** The chat itself loads only when it's first wanted (or hovered), so it costs the page nothing until then. */
type PanelModule = typeof import("@/components/chat/chat-panel");
let panelModule: Promise<PanelModule> | null = null;
const loadPanel = () => (panelModule ??= import("@/components/chat/chat-panel"));

const TEASER_KEY = "lusako-chat-teaser";

/**
 * The round chat button in the corner of every page (above the WhatsApp button when that shows), and the chat
 * window it opens. Like the WhatsApp button it stays out of the first screen until the page is scrolled, unless the
 * visitor already has a conversation. A returning visitor with a team member answering gets a badge for new replies.
 */
export function ChatLauncher({ config }: { config: ChatWidgetConfig }) {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [unread, setUnread] = useState(0);
  const [teaser, setTeaser] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // A conversation in this browser: the button always shows, and while a person is answering (or one was asked
  // for) the chat checks for their replies in the background.
  const raw = useSyncExternalStore(subscribeSavedChat, savedChatSnapshot, () => null);
  const saved = useMemo(() => parseSavedChat(raw), [raw]);
  const active = saved !== null;
  const mounted = opened || saved?.mode === "human" || Boolean(saved?.waiting);
  const [Panel, setPanel] = useState<PanelModule["ChatPanel"] | null>(null);

  useEffect(() => {
    if (!mounted || Panel) return;
    let live = true;
    void loadPanel().then((module) => {
      if (live) setPanel(() => module.ChatPanel);
    });
    return () => {
      live = false;
    };
  }, [mounted, Panel]);

  // The teaser: once per visit, on computers, a little while after the page opens, never once chatting.
  useEffect(() => {
    if (!config.teaser || active) return;
    let shown = false;
    try {
      shown = window.sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {}
    if (shown || !window.matchMedia("(min-width: 64rem) and (pointer: fine)").matches) return;
    const timer = window.setTimeout(() => {
      setTeaser(true);
      try {
        window.sessionStorage.setItem(TEASER_KEY, "1");
      } catch {}
    }, 12_000);
    return () => window.clearTimeout(timer);
  }, [config.teaser, active]);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  function toggle() {
    setTeaser(false);
    setOpened(true);
    setOpen((value) => !value);
  }

  const onUnread = useCallback((count: number) => setUnread(count), []);

  return (
    <>
      <div
        className={cn(
          "fixed right-[max(1rem,env(safe-area-inset-right))] z-40 flex items-center gap-3 lg:right-5",
          config.stacked
            ? "bottom-[calc(var(--cta-bar-h)+4.5rem)] lg:bottom-[4.25rem]"
            : "bottom-[calc(var(--cta-bar-h)+0.75rem)] lg:bottom-5",
          !active && !open && "appear-on-scroll",
          open && "pointer-events-none opacity-0",
        )}
      >
        {teaser && !open && (
          <div className="relative hidden max-w-60 animate-fade-up items-start gap-2 rounded-card-sm border border-line bg-white py-2.5 pr-2 pl-3.5 text-[13px] leading-snug text-ink shadow-float motion-reduce:animate-none lg:flex">
            <button type="button" onClick={toggle} className="cursor-pointer text-left font-medium">
              {config.teaser}
            </button>
            <button
              type="button"
              onClick={() => setTeaser(false)}
              aria-label="Dismiss"
              className="-mt-0.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-muted hover:bg-tint hover:text-ink"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </div>
        )}
        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          onPointerEnter={() => void loadPanel()}
          onFocus={() => void loadPanel()}
          aria-expanded={open}
          aria-controls="lusako-chat"
          aria-label={unread ? `Open the chat (${unread} new ${unread === 1 ? "reply" : "replies"})` : `Chat with ${config.name}`}
          tabIndex={open ? -1 : undefined}
          className="relative grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-brand text-white shadow-float transition-transform duration-200 ease-emph hover:-translate-y-0.5 active:scale-95"
        >
          <MessageCircleMore aria-hidden className="size-6" strokeWidth={1.9} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] leading-none font-bold text-white ring-2 ring-white tabular-nums">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>
      {mounted && Panel && <Panel id="lusako-chat" config={config} open={open} onClose={close} onUnread={onUnread} />}
    </>
  );
}
