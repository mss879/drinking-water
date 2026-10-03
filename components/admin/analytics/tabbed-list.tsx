"use client";

import { useState } from "react";
import { BarList, type BarRow } from "@/components/admin/charts/bar-list";
import { Panel } from "@/components/admin/ui/panel";
import { cn } from "@/lib/cn";

type Tab = { key: string; label: string; rows: BarRow[]; valueLabel: string; empty?: string };

/** A panel of ranked lists that share a space: Pages / Entry pages / Exit pages and so on. */
export function TabbedList({ title, tabs }: { title: string; tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const tab = tabs.find((item) => item.key === active) ?? tabs[0];
  return (
    <Panel
      title={title}
      action={
        <div role="tablist" aria-label={title} className="no-scrollbar -mr-1 flex max-w-full gap-1 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === tab?.key}
              onClick={() => setActive(item.key)}
              className={cn(
                "h-8 shrink-0 cursor-pointer rounded-full px-3 text-[13px] font-semibold transition-colors",
                item.key === tab?.key ? "bg-deep text-white" : "text-muted hover:bg-tint hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      {tab && <BarList rows={tab.rows} valueLabel={tab.valueLabel} empty={tab.empty} />}
    </Panel>
  );
}
