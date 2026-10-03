"use client";

import { useEffect, useState } from "react";
import { getLiveVisitors, type Live } from "@/app/actions/admin/analytics";
import { cn } from "@/lib/cn";

/** "On the site now", refreshed every 30 seconds while this tab is visible. */
export function LiveVisitors({ initial, showPages = false }: { initial: Live; showPages?: boolean }) {
  const [live, setLive] = useState(initial);

  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      const result = await getLiveVisitors();
      if (!stopped && result.ok && result.data) setLive(result.data);
    };
    const timer = window.setInterval(poll, 30_000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, []);

  return (
    <div className="card-line flex min-w-0 flex-col rounded-card-sm p-4 sm:p-5">
      <p className="flex items-center gap-2 text-[13px] text-muted">
        <span aria-hidden className="relative flex size-2.5">
          <span className={cn("absolute inset-0 rounded-full bg-brand", live.visitors > 0 && "animate-ping opacity-60")} />
          <span className="relative size-2.5 rounded-full bg-brand" />
        </span>
        On the site now
      </p>
      <p className="mt-1.5 font-display text-[26px] leading-tight font-bold text-ink" aria-live="polite">
        {live.visitors}
      </p>
      {showPages && live.pages.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-[12px]">
          {live.pages.slice(0, 3).map((page) => (
            <li key={page.path} className="flex justify-between gap-2 text-muted">
              <span className="truncate">{page.path}</span>
              <span className="font-semibold text-ink tabular-nums">{page.visitors}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[12px] text-muted">Active in the last 5 minutes</p>
      )}
    </div>
  );
}
