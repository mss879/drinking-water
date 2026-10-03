"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { KeyboardEventHandler } from "react";
import { CalendarClock, GripVertical } from "lucide-react";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/admin/format";
import { formatLKR } from "@/lib/format";
import type { Lead } from "@/lib/supabase/types";

/** How a follow-up date reads: overdue, today, or upcoming. */
function followUp(date: string | null, today: string) {
  if (!date) return null;
  if (date < today) return { label: `Overdue · ${formatShortDate(`${date}T00:00:00+05:30`)}`, tone: "bg-ink text-white" };
  if (date === today) return { label: "Follow up today", tone: "bg-deep text-white" };
  return { label: formatShortDate(`${date}T00:00:00+05:30`), tone: "bg-tint-2 text-deep" };
}

export function LeadCardBody({ lead, today }: { lead: Lead; today: string }) {
  const due = followUp(lead.follow_up_on, today);
  return (
    <>
      <span className="block truncate text-[15px] font-semibold text-ink">{lead.name}</span>
      {(lead.company || lead.location) && (
        <span className="mt-0.5 block truncate text-[13px] text-muted">{[lead.company, lead.location].filter(Boolean).join(" · ")}</span>
      )}
      {lead.interest && <span className="mt-2 line-clamp-2 block text-[13px] leading-snug text-ink">{lead.interest}</span>}
      <span className="mt-3 flex flex-wrap items-center gap-1.5">
        {lead.value !== null && <span className="text-[13px] font-bold text-deep tabular-nums">{formatLKR(lead.value)}</span>}
        {lead.priority === "high" && <Badge tone="solid">High</Badge>}
        {lead.source === "website" && <Badge tone="soft">Website</Badge>}
        {due && (
          <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold", due.tone)}>
            <CalendarClock aria-hidden className="size-3" />
            {due.label}
          </span>
        )}
      </span>
    </>
  );
}

/**
 * A lead on the board. Mouse and touch drag the whole card (a touch drag starts after a short press, so the board
 * still scrolls); keyboard users move it with the grip button. Clicking the card opens it.
 */
export function LeadCard({ lead, today, onOpen }: { lead: Lead; today: string; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: "card" },
  });
  const { onKeyDown, ...pointer } = listeners ?? {};

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...pointer}
      className={cn(
        "group relative touch-manipulation rounded-card-sm border border-line bg-white shadow-[0_1px_2px_color-mix(in_srgb,var(--color-ink)_5%,transparent)] transition-[border-color,box-shadow] hover:border-mist",
        isDragging && "opacity-40",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full cursor-pointer rounded-card-sm p-3.5 pr-9 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <LeadCardBody lead={lead} today={today} />
      </button>
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        onKeyDown={onKeyDown as KeyboardEventHandler<HTMLButtonElement> | undefined}
        aria-label={`Move ${lead.name}`}
        className="absolute top-2 right-1.5 grid size-8 cursor-grab place-items-center rounded-full text-mist transition-colors hover:bg-tint hover:text-deep active:cursor-grabbing"
      >
        <GripVertical aria-hidden className="size-4" />
      </button>
    </li>
  );
}
