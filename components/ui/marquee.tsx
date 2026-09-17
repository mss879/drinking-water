import { Droplet } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Endless ticker band. Pauses on hover; static for reduced-motion users. */
export function Marquee({
  items,
  tone = "pastel",
  duration = 45,
  className,
}: {
  items: string[];
  tone?: "pastel" | "ink";
  duration?: number;
  className?: string;
}) {
  const row = (
    <ul className="flex shrink-0 items-center">
      {[0, 1, 2].flatMap((copy) =>
        items.map((item) => (
          <li
            key={`${copy}-${item}`}
            className="flex items-center gap-6 pr-6 text-sm font-medium whitespace-nowrap sm:gap-8 sm:pr-8 sm:text-[15px]"
          >
            {item}
            <Droplet className={cn("size-3.5", tone === "pastel" ? "fill-brand text-brand" : "fill-aqua text-aqua")} />
          </li>
        )),
      )}
    </ul>
  );

  return (
    <div className={cn("group relative flex overflow-hidden py-3.5", tone === "pastel" ? "bg-pastel text-ink" : "bg-ink text-white", className)}>
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
