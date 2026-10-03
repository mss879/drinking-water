"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/admin/format";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS: Record<number, string> = { 0: "12am", 3: "3am", 6: "6am", 9: "9am", 12: "12pm", 15: "3pm", 18: "6pm", 21: "9pm" };
// One hue, light to dark (checked: monotone lightness, the light end clears the white card). Empty hours sit a step
// apart in the faint tint.
const STEPS = ["bg-brand/60", "bg-brand/80", "bg-brand", "bg-deep"];

function hourLabel(hour: number) {
  const suffix = hour < 12 ? "am" : "pm";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${suffix}`;
}

/** When people visit: visitors by weekday and hour of the day, in Sri Lanka time. */
export function Heatmap({ cells }: { cells: { weekday: number; hour: number; visitors: number }[] }) {
  const [hover, setHover] = useState<{ day: number; hour: number } | null>(null);
  const [asTable, setAsTable] = useState(false);
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const cell of cells) if (cell.weekday >= 1 && cell.weekday <= 7) grid[cell.weekday - 1][cell.hour] = cell.visitors;
  const max = Math.max(1, ...grid.flat());
  const step = (value: number) => (value <= 0 ? -1 : Math.min(3, Math.floor((value / max) * 4 - 1e-9)));
  const busiest = grid.flatMap((row, day) => row.map((value, hour) => ({ day, hour, value }))).sort((a, b) => b.value - a.value)[0];

  return (
    <figure>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
        {busiest && busiest.value > 0 ? (
          <span>
            Busiest: <strong className="font-semibold text-ink">{DAYS[busiest.day]}, {hourLabel(busiest.hour)}</strong>
          </span>
        ) : (
          <span>No visits in this period yet.</span>
        )}
        <span className="inline-flex items-center gap-1.5" aria-hidden>
          Fewer
          <span className="size-3 rounded-[3px] bg-tint-2" />
          {STEPS.map((tone) => (
            <span key={tone} className={cn("size-3 rounded-[3px]", tone)} />
          ))}
          More
        </span>
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
          <table className="w-full text-sm tabular-nums">
            <thead className="sticky top-0 bg-white text-left text-[13px] text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Hour</th>
                {DAYS.map((day) => (
                  <th key={day} className="px-2 py-2 text-right font-medium">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {Array.from({ length: 24 }, (_, hour) => (
                <tr key={hour}>
                  <td className="px-3 py-1">{hourLabel(hour)}</td>
                  {grid.map((row, day) => (
                    <td key={day} className="px-2 py-1 text-right">
                      {row[hour] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-scrollbar overflow-x-auto" role="img" aria-label="Visitors by weekday and hour. Show the table for the numbers.">
          <div className="relative min-w-[30rem]" onPointerLeave={() => setHover(null)}>
            {grid.map((row, day) => (
              <div key={day} className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] items-center gap-[2px] py-[1px]">
                <span className="text-[11px] text-muted">{DAYS[day]}</span>
                {row.map((value, hour) => {
                  const tone = step(value);
                  const active = hover?.day === day && hover.hour === hour;
                  return (
                    <span
                      key={hour}
                      onPointerEnter={() => setHover({ day, hour })}
                      className={cn(
                        "h-5 rounded-[3px] transition-[outline-color] sm:h-6",
                        tone < 0 ? "bg-tint" : STEPS[tone],
                        active && "outline-2 outline-offset-1 outline-ink",
                      )}
                    />
                  );
                })}
              </div>
            ))}
            <div className="mt-1.5 grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-[2px] text-[11px] text-muted" aria-hidden>
              <span />
              {Array.from({ length: 24 }, (_, hour) => (
                <span key={hour} className="whitespace-nowrap">
                  {HOUR_LABELS[hour] ?? ""}
                </span>
              ))}
            </div>
            {hover && (
              <div
                className="pointer-events-none absolute z-10 rounded-chip border border-line bg-white px-3 py-2 text-[13px] whitespace-nowrap shadow-float"
                style={{
                  top: `${(hover.day / 7) * 100}%`,
                  left: `calc(2.5rem + (100% - 2.5rem) * ${((hover.hour + 0.5) / 24).toFixed(4)})`,
                  transform: `translate(${hover.hour > 16 ? "-105%" : "8%"}, -110%)`,
                }}
              >
                <strong className="font-semibold text-ink tabular-nums">{formatNumber(grid[hover.day][hover.hour])}</strong>{" "}
                <span className="text-muted">
                  visitors · {DAYS[hover.day]} {hourLabel(hover.hour)}–{hourLabel((hover.hour + 1) % 24)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
