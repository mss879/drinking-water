"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/admin/format";

export type TrendPoint = { label: string; detail: string; visitors: number; pageviews: number };

const SERIES = [
  { key: "visitors", name: "Visitors", color: "var(--color-brand)", area: true },
  { key: "pageviews", name: "Page views", color: "var(--color-deep)", area: false },
] as const;

/** Round the top of the scale up to 1, 2 or 5 × 10ⁿ, so the gridlines land on clean numbers. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const nice of [1, 2, 2.5, 5, 10]) if (nice * step >= value) return nice * step;
  return 10 * step;
}

const W = 1000;
const H = 300;

/**
 * Visitors (area) and page views (line) over time, on one count axis. A crosshair follows the pointer or the arrow
 * keys and a tooltip lists both values at that point; the same numbers are one click away as a table.
 */
export function TrendChart({ points, className }: { points: TrendPoint[]; className?: string }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const max = niceMax(Math.max(1, ...points.flatMap((point) => [point.visitors, point.pageviews])));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((step) => Math.round(max * step));
  const x = (i: number) => (points.length <= 1 ? W / 2 : (i / (points.length - 1)) * W);
  const y = (value: number) => H - (value / max) * H;

  const paths = SERIES.map((series) => {
    const coords = points.map((point, i) => `${x(i).toFixed(1)},${y(point[series.key]).toFixed(1)}`);
    return {
      ...series,
      lineD: `M${coords.join("L")}`,
      fillD: `M${x(0)},${H}L${coords.join("L")}L${x(points.length - 1)},${H}Z`,
    };
  });

  // Around six labels along the bottom, whatever the range.
  const every = Math.max(1, Math.ceil(points.length / 6));
  const labelled = points.map((point, i) => ({ point, i })).filter(({ i }) => i % every === 0 || i === points.length - 1);

  function pick(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setHover(Math.round(ratio * (points.length - 1)));
  }

  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setHover((current) => {
      const at = current ?? points.length - 1;
      if (event.key === "Home") return 0;
      if (event.key === "End") return points.length - 1;
      return Math.min(points.length - 1, Math.max(0, at + (event.key === "ArrowLeft" ? -1 : 1)));
    });
  }

  const active = hover !== null ? points[hover] : null;
  const last = points[points.length - 1];

  return (
    <figure className={cn("min-w-0", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-4 rounded-full" style={{ background: series.color }} />
            {series.name}
            {last && <strong className="font-semibold text-ink tabular-nums">{formatNumber(last[series.key])}</strong>}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setAsTable((value) => !value)}
          aria-pressed={asTable}
          className="ml-auto cursor-pointer rounded-full px-2.5 py-1 font-semibold text-deep transition-colors hover:bg-tint"
        >
          {asTable ? "Show chart" : "Show as table"}
        </button>
      </div>

      {asTable ? (
        <div className="max-h-80 overflow-auto rounded-card-sm border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-[13px] text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 text-right font-medium">Visitors</th>
                <th className="px-3 py-2 text-right font-medium">Page views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {points.map((point) => (
                <tr key={point.detail}>
                  <td className="px-3 py-1.5">{point.detail}</td>
                  <td className="px-3 py-1.5 text-right">{formatNumber(point.visitors)}</td>
                  <td className="px-3 py-1.5 text-right">{formatNumber(point.pageviews)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
          {/* y-axis */}
          <div className="relative h-56 text-right text-[11px] text-muted tabular-nums sm:h-64" aria-hidden>
            {ticks.map((tick) => (
              <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - tick / max) * 100}%` }}>
                {formatNumber(tick)}
              </span>
            ))}
          </div>
          {/* plot */}
          <div
            role="img"
            aria-label={`Visitors and page views, ${points[0]?.detail ?? ""} to ${last?.detail ?? ""}. Use the arrow keys to read each point, or show the table.`}
            aria-describedby={`${id}-readout`}
            tabIndex={0}
            onPointerMove={pick}
            onPointerLeave={() => setHover(null)}
            onKeyDown={keys}
            onBlur={() => setHover(null)}
            className="relative h-56 cursor-crosshair touch-pan-y rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 sm:h-64"
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              {ticks.map((tick) => (
                <line key={tick} x1={0} x2={W} y1={y(tick)} y2={y(tick)} stroke="var(--color-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              ))}
              {paths.map((path) =>
                path.area ? <path key={`${path.key}-fill`} d={path.fillD} fill={path.color} fillOpacity={0.1} /> : null,
              )}
              {paths.map((path) => (
                <path
                  key={path.key}
                  d={path.lineD}
                  fill="none"
                  stroke={path.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {hover !== null && (
                <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="var(--color-mist)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              )}
            </svg>
            {/* Markers are HTML so they stay round on a stretched plot. */}
            {active &&
              SERIES.map((series) => (
                <span
                  key={series.key}
                  aria-hidden
                  className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
                  style={{ left: `${(x(hover!) / W) * 100}%`, top: `${(y(active[series.key]) / H) * 100}%`, background: series.color }}
                />
              ))}
            {active && (
              <div
                className="pointer-events-none absolute top-2 z-10 w-max min-w-36 rounded-chip border border-line bg-white px-3 py-2.5 text-[13px] shadow-float"
                style={hover! / Math.max(points.length - 1, 1) > 0.6 ? { right: `${100 - (x(hover!) / W) * 100 + 2}%` } : { left: `${(x(hover!) / W) * 100 + 2}%` }}
              >
                <p className="text-muted">{active.detail}</p>
                {SERIES.map((series) => (
                  <p key={series.key} className="mt-1 flex items-center gap-2">
                    <span aria-hidden className="h-[3px] w-3 rounded-full" style={{ background: series.color }} />
                    <strong className="font-semibold text-ink tabular-nums">{formatNumber(active[series.key])}</strong>
                    <span className="text-muted">{series.name.toLowerCase()}</span>
                  </p>
                ))}
              </div>
            )}
            <p id={`${id}-readout`} className="sr-only" aria-live="polite">
              {active ? `${active.detail}: ${active.visitors} visitors, ${active.pageviews} page views` : ""}
            </p>
          </div>
          {/* x-axis */}
          <div />
          <div className="relative mt-2 h-4 text-[11px] text-muted" aria-hidden>
            {labelled.map(({ point, i }) => (
              <span
                key={i}
                className={cn("absolute whitespace-nowrap", i === 0 ? "left-0" : i === points.length - 1 ? "right-0" : "-translate-x-1/2")}
                style={i === 0 || i === points.length - 1 ? undefined : { left: `${(x(i) / W) * 100}%` }}
              >
                {point.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </figure>
  );
}
