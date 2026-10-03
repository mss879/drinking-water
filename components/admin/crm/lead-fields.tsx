"use client";

import type { LeadInput } from "@/app/actions/admin/crm";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/field";
import { priorityLabels, sourceLabels } from "@/lib/admin/crm";
import type { Lead, LeadPriority, LeadSourceKind, Stage } from "@/lib/supabase/types";

/** The lead form's values as the inputs hold them (text), and their conversion to what the server expects. */
export type LeadDraft = Record<
  "name" | "phone" | "email" | "company" | "location" | "interest" | "value" | "follow_up_on" | "notes" | "stage_id",
  string
> & { source: LeadSourceKind; priority: LeadPriority };

export function draftFromLead(lead: Lead | null, stageId: string): LeadDraft {
  return {
    name: lead?.name ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    company: lead?.company ?? "",
    location: lead?.location ?? "",
    interest: lead?.interest ?? "",
    value: lead?.value !== null && lead?.value !== undefined ? String(lead.value) : "",
    follow_up_on: lead?.follow_up_on ?? "",
    notes: lead?.notes ?? "",
    stage_id: lead?.stage_id ?? stageId,
    source: lead?.source ?? "manual",
    priority: lead?.priority ?? "medium",
  };
}

export function inputFromDraft(draft: LeadDraft): LeadInput {
  const value = draft.value.replace(/[^\d.]/g, "");
  return { ...draft, value: value ? Number(value) : null, follow_up_on: draft.follow_up_on || null };
}

/** Name, contact details, the deal and the follow-up date. */
export function LeadFields({
  draft,
  onChange,
  stages,
  showStage = false,
  idPrefix,
}: {
  draft: LeadDraft;
  onChange: (draft: LeadDraft) => void;
  stages: Stage[];
  showStage?: boolean;
  idPrefix: string;
}) {
  const set = <K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) => onChange({ ...draft, [key]: value });
  const id = (name: string) => `${idPrefix}-${name}`;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" htmlFor={id("name")} className="sm:col-span-2">
        <Input id={id("name")} value={draft.name} onChange={(e) => set("name", e.target.value)} required maxLength={200} autoComplete="off" />
      </Field>
      <Field label="Phone" htmlFor={id("phone")}>
        <Input id={id("phone")} type="tel" inputMode="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} maxLength={40} />
      </Field>
      <Field label="Email" htmlFor={id("email")}>
        <Input id={id("email")} type="email" inputMode="email" value={draft.email} onChange={(e) => set("email", e.target.value)} maxLength={200} />
      </Field>
      <Field label="Company" htmlFor={id("company")}>
        <Input id={id("company")} value={draft.company} onChange={(e) => set("company", e.target.value)} maxLength={200} />
      </Field>
      <Field label="Location" htmlFor={id("location")}>
        <Input id={id("location")} value={draft.location} onChange={(e) => set("location", e.target.value)} maxLength={200} />
      </Field>
      <Field label="Interested in" htmlFor={id("interest")} className="sm:col-span-2" hint="e.g. Rental · AquaElite 3X · 12 people">
        <Input id={id("interest")} value={draft.interest} onChange={(e) => set("interest", e.target.value)} maxLength={200} />
      </Field>
      <Field label="Deal value (LKR)" htmlFor={id("value")}>
        <Input id={id("value")} inputMode="numeric" value={draft.value} onChange={(e) => set("value", e.target.value)} placeholder="0" />
      </Field>
      <Field label="Follow up on" htmlFor={id("follow")}>
        <Input id={id("follow")} type="date" value={draft.follow_up_on} onChange={(e) => set("follow_up_on", e.target.value)} />
      </Field>
      <Field label="Priority" htmlFor={id("priority")}>
        <Select id={id("priority")} value={draft.priority} onChange={(e) => set("priority", e.target.value as LeadPriority)}>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Source" htmlFor={id("source")}>
        <Select id={id("source")} value={draft.source} onChange={(e) => set("source", e.target.value as LeadSourceKind)}>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      {showStage && (
        <Field label="Stage" htmlFor={id("stage")} className="sm:col-span-2">
          <Select id={id("stage")} value={draft.stage_id} onChange={(e) => set("stage_id", e.target.value)}>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Notes" htmlFor={id("notes")} className="sm:col-span-2">
        <Textarea id={id("notes")} value={draft.notes} onChange={(e) => set("notes", e.target.value)} maxLength={5000} />
      </Field>
    </div>
  );
}
