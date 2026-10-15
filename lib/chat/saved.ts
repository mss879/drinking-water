import type { PublicState } from "@/lib/chat/types";

/**
 * The only thing the browser keeps about a chat: its id and secret (and who was last answering, so a returning
 * visitor's button can check for a team member's replies). The conversation itself stays on the server.
 */
const STORE_KEY = "lusako-chat";
const CHANGE = "lusako-chat-change";

export type SavedChat = {
  id: string;
  token: string;
  mode?: PublicState["mode"];
  waiting?: boolean;
  /** The newest message the visitor has seen with the chat open, so replies that came later count as new. */
  seen?: string;
};

/** The stored text as it is (a stable snapshot for useSyncExternalStore). */
export function savedChatSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
}

/** Calls back when the saved chat changes, in this tab or another. */
export function subscribeSavedChat(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORE_KEY) listener();
  };
  window.addEventListener(CHANGE, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function parseSavedChat(raw: string | null): SavedChat | null {
  try {
    const saved = JSON.parse(raw ?? "null") as SavedChat | null;
    return saved && typeof saved.id === "string" && typeof saved.token === "string" ? saved : null;
  } catch {
    return null;
  }
}

export function readSavedChat() {
  return parseSavedChat(savedChatSnapshot());
}

export function writeSavedChat(saved: SavedChat | null) {
  // Keep the "seen" marker when only the rest changes.
  const existing = readSavedChat();
  if (saved && saved.seen === undefined && existing?.id === saved.id && existing.seen) saved = { ...saved, seen: existing.seen };
  try {
    if (saved) window.localStorage.setItem(STORE_KEY, JSON.stringify(saved));
    else window.localStorage.removeItem(STORE_KEY);
  } catch {}
  window.dispatchEvent(new Event(CHANGE));
}
