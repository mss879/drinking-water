import { Droplet } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const tones = {
  // Large type only on #278CF0, so white text keeps enough contrast.
  brand: { band: "bg-brand text-white", drop: "fill-white text-white" },
  tint: { band: "bg-tint-2 text-deep", drop: "fill-brand text-brand" },
  ink: { band: "bg-ink text-white", drop: "fill-brand text-brand" },
} as const;

/** Endless ticker band. Speed follows the scroll (MotionRoot); pauses on hover; static for reduced motion. */
export function Marquee({
  items,
  tone = "brand",
  duration = 45,
  className,
}: {
  items: string[];
  tone?: keyof typeof tones;
  duration?: number;
  className?: string;
}) {
  const t = tones[tone];
  const row = (
    <ul className="flex shrink-0 items-center">
      {[0, 1, 2].flatMap((copy) =>
        items.map((item) => (
          <li
            key={`${copy}-${item}`}
            className="flex items-center gap-8 pr-8 font-display text-2xl font-bold tracking-[-0.01em] whitespace-nowrap uppercase sm:gap-10 sm:pr-10 sm:text-[1.75rem]"
          >
            {item}
            <Droplet className={cn("size-5", t.drop)} />
          </li>
        )),
      )}
    </ul>
  );

  return (
    <div className={cn("group relative flex overflow-hidden py-6 sm:py-7", t.band, className)}>
      <p className="sr-only">{items.join(". ")}</p>
      <div
        aria-hidden
        data-marquee-track
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        {row}
        {row}
      </div>
    </div>
  );
}
