"use client";

import { useSyncExternalStore } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: Tone };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function dismiss(id: number) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

/** Shows a short message in the corner of the admin. Errors stay a little longer. */
export function toast(message: string, tone: Tone = "success") {
  const id = nextId++;
  toasts = [...toasts.slice(-3), { id, message, tone }];
  emit();
  window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
}

const icons = { success: CircleCheck, error: CircleAlert, info: Info } as const;

export function Toaster() {
  const items = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
    () => toasts,
  );
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
    >
      {items.map((item) => {
        const Icon = icons[item.tone];
        return (
          <div
            key={item.id}
            role={item.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-card-sm border border-line bg-white py-3 pr-2 pl-4 text-sm text-ink shadow-float"
          >
            <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", item.tone === "error" ? "text-danger" : "text-deep")} />
            <p className="min-w-0 flex-1 leading-snug">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-tint hover:text-ink"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
