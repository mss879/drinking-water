import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { InquiryStatus } from "@/lib/supabase/types";

const tones = {
  solid: "bg-deep text-white",
  soft: "bg-tint-2 text-deep",
  outline: "border border-ink/15 text-ink",
  muted: "bg-ink/5 text-muted",
  white: "bg-white text-deep border border-line",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "soft", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs leading-none font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const inquiryStatuses: Record<InquiryStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "solid" },
  in_progress: { label: "In progress", tone: "soft" },
  resolved: { label: "Resolved", tone: "outline" },
  spam: { label: "Spam", tone: "muted" },
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const { label, tone } = inquiryStatuses[status];
  return <Badge tone={tone}>{label}</Badge>;
}
