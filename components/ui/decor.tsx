import { cn } from "@/lib/cn";

/** Scattered pixel squares — the reference's decorative motif, in blue. */
export function PixelCluster({ className, variant = "a" }: { className?: string; variant?: "a" | "b" }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className={cn("pointer-events-none", className)}>
      {variant === "a" ? (
        <>
          <rect x="20" y="0" width="20" height="20" className="fill-mist" />
          <rect x="0" y="20" width="20" height="20" className="fill-sky" />
          <rect x="20" y="20" width="20" height="20" className="fill-pastel" />
          <rect x="40" y="40" width="20" height="20" className="fill-mist" />
        </>
      ) : (
        <>
          <rect x="0" y="0" width="20" height="20" className="fill-pastel" />
          <rect x="20" y="20" width="20" height="20" className="fill-sky" />
          <rect x="40" y="20" width="20" height="20" className="fill-mist" />
          <rect x="20" y="40" width="20" height="20" className="fill-pastel" />
        </>
      )}
    </svg>
  );
}

/** Concentric ripple rings (reference "International environment day" card). */
export function Rings({ className, count = 7 }: { className?: string; count?: number }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden fill="none" stroke="currentColor" className={cn("pointer-events-none", className)}>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r={10 + (i * 88) / Math.max(count - 1, 1)}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
