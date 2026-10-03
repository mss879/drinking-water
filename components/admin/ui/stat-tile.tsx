import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Sparkline } from "@/components/admin/charts/sparkline";
import { cn } from "@/lib/cn";

/**
 * One headline number: label, value, the change against the previous period and an optional sparkline. The arrow
 * carries the direction; whether that's good news is in the words, not a traffic-light colour (the palette is the
 * brand's blues).
 */
export function StatTile({
  label,
  value,
  delta,
  goodWhenUp = true,
  trend,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: number | null;
  goodWhenUp?: boolean;
  trend?: number[];
  hint?: ReactNode;
  className?: string;
}) {
  const flat = delta === 0 || delta === undefined;
  const up = (delta ?? 0) > 0;
  const good = flat ? null : up === goodWhenUp;
  return (
    <div className={cn("card-line flex min-w-0 flex-col rounded-card-sm p-4 sm:p-5", className)}>
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1.5 truncate font-display text-[26px] leading-tight font-bold text-ink">{value}</p>
      <div className="mt-2 flex min-h-5 items-center gap-2 text-[12px]">
        {delta === null ? (
          <span className="text-muted">New this period</span>
        ) : delta !== undefined ? (
          <span className={cn("inline-flex items-center gap-1 font-semibold", good === false ? "text-ink" : "text-deep")}>
            {flat ? <Minus aria-hidden className="size-3.5" /> : up ? <ArrowUpRight aria-hidden className="size-3.5" /> : <ArrowDownRight aria-hidden className="size-3.5" />}
            {flat ? "No change" : `${up ? "+" : "−"}${Math.abs(Math.round(delta * 100))}%`}
            <span className="font-normal text-muted">vs previous{good === null ? "" : good ? " · better" : " · worse"}</span>
          </span>
        ) : (
          hint && <span className="text-muted">{hint}</span>
        )}
      </div>
      {trend && trend.length > 1 && <Sparkline values={trend} className="mt-3 h-8 w-full" />}
    </div>
  );
}
