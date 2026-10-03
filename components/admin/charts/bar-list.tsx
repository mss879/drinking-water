import type { ReactNode } from "react";
import { formatNumber } from "@/lib/admin/format";

export type BarRow = { label: string; value: number; secondary?: ReactNode; href?: string };

/**
 * A ranked list with a light bar behind each row, sized to its value (the usual web-analytics list). The bar is a
 * single tint, so the text over it always reads; the value sits at the end in ink.
 */
export function BarList({
  rows,
  valueLabel,
  empty = "Nothing yet for this period.",
  format = formatNumber,
}: {
  rows: BarRow[];
  valueLabel: string;
  empty?: string;
  format?: (value: number) => string;
}) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div>
      <div className="mb-1.5 flex justify-end text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{valueLabel}</div>
      <ul className="grid gap-1">
        {rows.map((row) => (
          <li key={row.label} className="relative flex min-h-9 items-center gap-3 rounded-chip px-3 text-sm">
            <span aria-hidden className="absolute inset-y-0 left-0 rounded-chip bg-tint-2" style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} />
            <span className="relative min-w-0 flex-1 truncate text-ink" title={row.label}>
              {row.label}
            </span>
            {row.secondary && <span className="relative shrink-0 text-[13px] text-muted tabular-nums">{row.secondary}</span>}
            <span className="relative w-14 shrink-0 text-right font-semibold text-ink tabular-nums">{format(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
