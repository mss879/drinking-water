"use client";

import { ArrowUpRight } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = { title: ReactNode; content: ReactNode };

const tones = {
  light: {
    row: "card-line transition-colors duration-300",
    open: "border-brand/40 bg-tint",
    closed: "hover:border-brand/40",
    title: "text-ink",
    body: "text-muted",
    icon: { open: "bg-deep text-white", closed: "bg-tint-2 text-deep" },
  },
  // The StomDent FAQ: rows ruled on black, the open row lifted onto deep blue.
  dark: {
    row: "rounded-card-sm border-b border-white/15 transition-colors duration-300",
    open: "border-transparent bg-deep",
    closed: "hover:bg-white/5",
    title: "text-white",
    body: "text-white/85",
    icon: { open: "bg-white text-deep", closed: "border border-white/25 text-white" },
  },
} as const;

/** Disclosure rows. One row open at a time; panels glide open. */
export function Accordion({
  items,
  defaultOpen = 0,
  headingLevel = 3,
  tone = "light",
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
  headingLevel?: 2 | 3 | 4;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const uid = useId();
  const Heading = `h${headingLevel}` as "h3";
  const t = tones[tone];

  return (
    <div data-stagger className={cn("flex flex-col", tone === "light" ? "gap-3" : "gap-1", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${uid}-button-${i}`;
        const panelId = `${uid}-panel-${i}`;
        return (
          <div key={i} className={cn(t.row, isOpen ? t.open : t.closed)}>
            <Heading className="m-0 font-sans">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 rounded-card-sm px-5 py-5 text-left sm:px-7 sm:py-6"
              >
                <span className={cn("text-base leading-snug font-medium sm:text-lg", t.title)}>{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ease-emph",
                    isOpen ? t.icon.open : cn(t.icon.closed, "rotate-90"),
                  )}
                >
                  <ArrowUpRight className="size-[18px]" strokeWidth={1.75} />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-emph motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "px-5 pb-6 transition-opacity duration-500 sm:px-7 sm:pb-7",
                    isOpen ? "opacity-100 delay-100" : "opacity-0",
                  )}
                >
                  <div className={cn("max-w-3xl text-[15px] leading-relaxed sm:text-base", t.body)}>{item.content}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
