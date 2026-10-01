import { cn } from "@/lib/cn";

/**
 * Coastline of Sri Lanka as (longitude, latitude) points, clockwise from Point Pedro. A simplified outline is
 * enough for a decorative map; the pin sits on Colombo.
 */
const COAST: [number, number][] = [
  [80.22, 9.82], [79.9, 9.72], [79.85, 9.5], [79.9, 8.98], [79.72, 8.3], [79.83, 8.0], [79.79, 7.57], [79.84, 7.2],
  [79.85, 6.93], [79.96, 6.58], [80.0, 6.42], [80.22, 6.03], [80.55, 5.95], [80.59, 5.92], [80.79, 6.02], [81.12, 6.12],
  [81.33, 6.22], [81.6, 6.5], [81.83, 6.85], [81.83, 7.4], [81.7, 7.72], [81.55, 7.95], [81.23, 8.57], [80.98, 9.0],
  [80.82, 9.27], [80.4, 9.52],
];
const COLOMBO: [number, number] = [79.85, 6.93];

/** Equirectangular projection into a 240 × 410 box (1° ≈ 100 units; the island sits near the equator). */
const project = ([lon, lat]: [number, number]) => [(lon - 79.6) * 100, (9.9 - lat) * 100] as const;

/** A closed, smooth path through the points (Catmull–Rom converted to cubic Béziers). */
function smoothClosedPath(points: [number, number][]) {
  const p = points.map(project);
  const n = p.length;
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + " Z";
}

const ISLAND = smoothClosedPath(COAST);
const [pinX, pinY] = project(COLOMBO);

/**
 * Decorative map of Sri Lanka (the StomDent contact block's map): a dotted island in brand tints, an outline
 * that draws itself as it scrolls in, and a pulsing deep-blue pin on Colombo.
 */
export function SriLankaMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 410" aria-hidden data-draw-trigger className={cn("block", className)}>
      <defs>
        <pattern id="lk-dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.5" className="fill-brand/45" />
        </pattern>
        <clipPath id="lk-clip">
          <path d={ISLAND} />
        </clipPath>
      </defs>
      <path d={ISLAND} className="fill-tint-2" />
      <rect width="240" height="410" fill="url(#lk-dots)" clipPath="url(#lk-clip)" />
      <path
        d={ISLAND}
        data-draw
        data-draw-start="top 90%"
        data-draw-end="bottom 50%"
        fill="none"
        className="stroke-brand"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g transform={`translate(${pinX.toFixed(1)} ${pinY.toFixed(1)})`}>
        <circle r="11" className="fill-deep/25 motion-safe:animate-ping" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        <circle r="6.5" className="fill-white stroke-deep" strokeWidth="2.5" />
        <circle r="2.4" className="fill-deep" />
      </g>
    </svg>
  );
}
