"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The name a team member shows visitors when they answer a chat ("Anjali from LUSAKO joined the chat"). Kept in
 * this browser; the first time it's worked out from the admin's email, or "LUSAKO team" for a shared address.
 */
const KEY = "lusako-admin-chat-name";
const SHARED = new Set(["admin", "info", "sales", "support", "hello", "contact", "office", "operations", "team", "lusako", "enquiries", "inquiries"]);
const listeners = new Set<() => void>();

export function nameFromEmail(email: string) {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  const first = local.split(/[._+-]/)[0] ?? "";
  if (!first || SHARED.has(first) || /\d/.test(first) || first.length < 2) return "LUSAKO team";
  return first[0].toUpperCase() + first.slice(1);
}

function read() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function useAgentName(email: string): [string, (name: string) => void] {
  const saved = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => null,
  );
  const set = useCallback((name: string) => {
    try {
      window.localStorage.setItem(KEY, name.trim().slice(0, 40));
    } catch {}
    listeners.forEach((listener) => listener());
  }, []);
  return [saved?.trim() || nameFromEmail(email), set];
}
