"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { Input } from "@/components/admin/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { RANGE_PRESETS, type RangeKey } from "@/lib/admin/ranges";

/** The period every number on the page uses: presets first, a custom range behind a button. */
export function RangeFilter({ active, fromDay, toDay }: { active: RangeKey; fromDay: string; toDay: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [custom, setCustom] = useState(active === "custom");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {RANGE_PRESETS.map((preset) => (
          <Link
            key={preset.key}
            href={`${pathname}?range=${preset.key}`}
            aria-current={active === preset.key ? "true" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-semibold transition-colors",
              active === preset.key ? "bg-deep text-white" : "bg-white text-ink ring-1 ring-line hover:ring-mist",
            )}
          >
            {preset.label}
          </Link>
        ))}
        <button
          type="button"
          aria-expanded={custom}
          onClick={() => setCustom((value) => !value)}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
            active === "custom" ? "bg-deep text-white" : "bg-white text-ink ring-1 ring-line hover:ring-mist",
          )}
        >
          <CalendarRange aria-hidden className="size-4" />
          Custom
        </button>
      </div>
      {custom && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            router.push(`${pathname}?range=custom&from=${form.get("from")}&to=${form.get("to")}`);
          }}
        >
          <label className="grid gap-1 text-[13px] font-semibold text-ink">
            From
            <Input name="from" type="date" defaultValue={fromDay} required className="h-10 w-44" />
          </label>
          <label className="grid gap-1 text-[13px] font-semibold text-ink">
            To
            <Input name="to" type="date" defaultValue={toDay} required className="h-10 w-44" />
          </label>
          <Button type="submit" size="sm">
            Apply
          </Button>
        </form>
      )}
    </div>
  );
}
