"use client";

import { useSyncExternalStore } from "react";
import { NO_TRACK_KEY } from "@/lib/analytics/config";

function read() {
  try {
    return window.localStorage.getItem(NO_TRACK_KEY) === "1";
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();

/** Keeps this browser's own visits out of the numbers (on by default once an admin has signed in here). */
export function TrackingToggle() {
  const excluded = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => true,
  );
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13px] text-muted select-none">
      <input
        type="checkbox"
        checked={excluded}
        onChange={(event) => {
          try {
            if (event.target.checked) window.localStorage.setItem(NO_TRACK_KEY, "1");
            else window.localStorage.removeItem(NO_TRACK_KEY);
          } catch {}
          listeners.forEach((listener) => listener());
        }}
        className="size-4 cursor-pointer accent-deep"
      />
      Don’t count my visits from this browser
    </label>
  );
}
