"use client";

import { ArrowUpRight } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = { title: ReactNode; content: ReactNode };

/** Rounded disclosure rows — the reference "Get Involved" list. One row open at a time; panels glide open. */
export function Accordion({
  items,
  defaultOpen = 0,
  headingLevel = 3,
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const uid = useId();
  const Heading = `h${headingLevel}` as "h3";

  return (
    <div data-stagger className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${uid}-button-${i}`;
        const panelId = `${uid}-panel-${i}`;
        return (
          <div
            key={i}
            className={cn("rounded-card-sm transition-colors duration-300", isOpen ? "bg-pastel" : "bg-frost hover:bg-ice")}
          >
            <Heading className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 rounded-card-sm px-5 py-5 text-left sm:px-8 sm:py-6"
              >
                <span className="text-lg leading-snug font-normal text-ink sm:text-xl">{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform duration-300 ease-emph",
                    !isOpen && "rotate-90",
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
                    "px-5 pb-6 transition-opacity duration-500 sm:px-8 sm:pb-7",
                    isOpen ? "opacity-100 delay-100" : "opacity-0",
                  )}
                >
                  <div className="max-w-3xl text-[15px] leading-relaxed text-muted sm:text-base">{item.content}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
