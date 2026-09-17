"use client";

import { Building2, House, Network, Wrench, type LucideIcon } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";
import { LeadForm } from "@/components/forms/lead-form";
import { leadForms, leadFormTypes, type LeadFormType } from "@/content/forms";
import { cn } from "@/lib/cn";

const icons: Record<LeadFormType, LucideIcon> = {
  buy: House,
  rental: Building2,
  corporate: Network,
  service: Wrench,
};

/**
 * Purpose-specific quote forms as a pill tablist (brief §14: never one generic form).
 * Manual activation: the arrow keys move focus between tabs and Enter or Space switches,
 * so a half-filled form is never swapped out by accident.
 */
export function ContactTabs({
  initialType = "buy",
  prefill,
}: {
  initialType?: LeadFormType;
  prefill?: Record<string, string>;
}) {
  const [active, setActive] = useState<LeadFormType>(initialType);
  const uid = useId();
  const labelId = `${uid}-label`;
  const tabId = (type: LeadFormType) => `${uid}-tab-${type}`;
  const panelId = (type: LeadFormType) => `${uid}-panel-${type}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const index = tabs.findIndex((tab) => tab === document.activeElement);
    if (index === -1) return;
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
  };

  return (
    <div>
      <p id={labelId} className="text-sm font-medium text-muted">
        What can we help with?
      </p>
      <div
        role="tablist"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
      >
        {leadFormTypes.map((type) => {
          const selected = type === active;
          const Icon = icons[type];
          return (
            <button
              key={type}
              id={tabId(type)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(type)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(type)}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-2.5 rounded-card-sm px-3.5 py-2 text-left text-sm leading-tight font-medium transition-colors duration-200 sm:h-11 sm:min-h-0 sm:rounded-full sm:px-4 sm:py-0",
                selected ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink/30",
              )}
            >
              <Icon aria-hidden className={cn("size-4 shrink-0", selected ? "text-aqua" : "text-brand")} strokeWidth={1.75} />
              {leadForms[type].label}
            </button>
          );
        })}
      </div>

      {leadFormTypes.map((type) => {
        const selected = type === active;
        const config = leadForms[type];
        return (
          <div
            key={type}
            id={panelId(type)}
            role="tabpanel"
            aria-labelledby={tabId(type)}
            hidden={!selected}
            tabIndex={0}
            className="mt-8 rounded-card-sm sm:mt-10"
          >
            {selected && (
              <>
                <h2 className="text-h3 font-medium text-ink">{config.title}</h2>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{config.description}</p>
                <LeadForm key={type} type={type} prefill={type === initialType ? prefill : undefined} className="mt-8" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
