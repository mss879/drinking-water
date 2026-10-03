/** A small trend line for a stat tile: the shape of the period, no axes. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 100;
  const h = 28;
  const coords = values.map((value, i) => `${((i / (values.length - 1)) * w).toFixed(2)},${(h - (value / max) * (h - 2) - 1).toFixed(2)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden className={className}>
      <path d={`M0,${h}L${coords.join("L")}L${w},${h}Z`} fill="var(--color-brand)" fillOpacity={0.1} />
      <path
        d={`M${coords.join("L")}`}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
