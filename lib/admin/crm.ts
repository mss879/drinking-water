import type { ActivityKind, LeadPriority, LeadSourceKind, StageOutcome } from "@/lib/supabase/types";

export const sourceLabels: Record<LeadSourceKind, string> = {
  website: "Website",
  manual: "Added by hand",
  phone: "Phone call",
  whatsapp: "WhatsApp",
  referral: "Referral",
  walk_in: "Walk-in",
  event: "Event",
  other: "Other",
};

export const priorityLabels: Record<LeadPriority, string> = { high: "High", medium: "Medium", low: "Low" };

export const outcomeLabels: Record<StageOutcome, string> = {
  open: "Open (in progress)",
  won: "Won (a sale)",
  lost: "Lost",
};

export const activityLabels: Record<ActivityKind, string> = {
  created: "Created",
  note: "Note",
  stage_change: "Stage",
  call: "Call",
  email: "Email",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
};
