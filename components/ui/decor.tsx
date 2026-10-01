import { cn } from "@/lib/cn";

/** A smooth sine-like wave built from quadratic curves, `width` long, one crest every `wavelength` / 2. */
export function wavePath({ width, y, amplitude, wavelength, phase = 0 }: {
  width: number;
  y: number;
  amplitude: number;
  wavelength: number;
  phase?: number;
}) {
  const half = wavelength / 2;
  const start = -((phase % 1) * wavelength);
  let d = `M${start} ${y} Q${start + half / 2} ${y - amplitude} ${start + half} ${y}`;
  for (let x = start + wavelength; x <= width + wavelength; x += half) d += ` T${x} ${y}`;
  return d;
}

/** Wavelengths divide 1440, so each line tiles seamlessly while it drifts one viewBox width. */
const LINES = [
  { y: 150, amplitude: 34, wavelength: 720, phase: 0, speed: 38, opacity: 1 },
  { y: 176, amplitude: 26, wavelength: 480, phase: 0.3, speed: 30, opacity: 0.7 },
  { y: 204, amplitude: 40, wavelength: 1440, phase: 0.6, speed: 52, opacity: 0.5 },
  { y: 122, amplitude: 20, wavelength: 360, phase: 0.15, speed: 26, opacity: 0.35 },
  { y: 232, amplitude: 30, wavelength: 720, phase: 0.8, speed: 44, opacity: 0.25 },
];

/**
 * Flowing wave lines, the water motif across bands and heroes (StomDent's wave, drawn in the brand blues).
 * Colour comes from the text colour. Each line drifts sideways at its own pace unless motion is reduced.
 */
export function WaveLines({ className, lines = 4, drift = true }: { className?: string; lines?: number; drift?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      fill="none"
      stroke="currentColor"
      className={cn("pointer-events-none", className)}
    >
      {LINES.slice(0, lines).map((line, i) => (
        <g key={i} className={drift ? "wave-drift" : undefined} style={{ ["--wave-speed" as string]: `${line.speed}s` }}>
          <path
            d={wavePath({ width: 2880, ...line })}
            strokeWidth="1.5"
            strokeOpacity={line.opacity}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * A hairline divider that draws itself from the left as it scrolls into view (MotionRoot `[data-draw]`).
 * Colour comes from the text colour.
 */
export function Rule({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 2"
      preserveAspectRatio="none"
      className={cn("pointer-events-none block h-px w-full overflow-visible text-line", className)}
    >
      <line data-draw data-draw-start="top 94%" data-draw-end="top 62%" x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
