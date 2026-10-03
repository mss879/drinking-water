"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowRightLeft, Inbox, Mail, MessageCircle, Phone, StickyNote, Trash2, Users } from "lucide-react";
import { addActivity, deleteLead, getLeadActivities, moveLead, updateLead } from "@/app/actions/admin/crm";
import { draftFromLead, inputFromDraft, LeadFields, type LeadDraft } from "@/components/admin/crm/lead-fields";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Select, Textarea } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button, ButtonLink, buttonClasses } from "@/components/ui/button";
import { activityLabels } from "@/lib/admin/crm";
import { formatAgo, formatDateTime, whatsappNumber } from "@/lib/admin/format";
import type { Activity, ActivityKind, Lead, Stage } from "@/lib/supabase/types";

const activityIcons: Partial<Record<ActivityKind, typeof StickyNote>> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Users,
  stage_change: ArrowRightLeft,
  created: Inbox,
};

/** A lead in full: edit it, move it, log what happened, or delete it. */
export function LeadSheet({
  lead,
  stages,
  onClose,
  onChanged,
}: {
  lead: Lead;
  stages: Stage[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState<LeadDraft>(() => draftFromLead(lead, lead.stage_id));
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<ActivityKind>("note");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let live = true;
    void getLeadActivities(lead.id).then((result) => {
      if (live) setActivities(result.ok ? (result.data ?? []) : []);
    });
    return () => {
      live = false;
    };
  }, [lead.id, lead.stage_id]);

  const wa = whatsappNumber(lead.phone);
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftFromLead(lead, lead.stage_id));

  function save() {
    startTransition(async () => {
      const result = await updateLead(lead.id, inputFromDraft(draft));
      if (!result.ok) return toast(result.error, "error");
      if (draft.stage_id !== lead.stage_id) {
        const moved = await moveLead(lead.id, draft.stage_id, null);
        if (!moved.ok) return toast(moved.error, "error");
      }
      toast("Lead saved.");
      onChanged();
    });
  }

  function log() {
    startTransition(async () => {
      const result = await addActivity(lead.id, kind, note);
      if (!result.ok) return toast(result.error, "error");
      setNote("");
      const refreshed = await getLeadActivities(lead.id);
      if (refreshed.ok) setActivities(refreshed.data ?? []);
    });
  }

  return (
    <Dialog open side onClose={onClose} title={lead.name} description={`Added ${formatDateTime(lead.created_at)}`}>
      <div className="grid gap-6">
        {(lead.phone || lead.email) && (
          <div className="grid grid-cols-3 gap-2">
            {lead.phone ? (
              <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
                <Phone aria-hidden className="size-4" /> Call
              </a>
            ) : (
              <span />
            )}
            {wa ? (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
                <MessageCircle aria-hidden className="size-4" /> WhatsApp
              </a>
            ) : (
              <span />
            )}
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
                <Mail aria-hidden className="size-4" /> Email
              </a>
            ) : (
              <span />
            )}
          </div>
        )}

        <LeadFields draft={draft} onChange={setDraft} stages={stages} showStage idPrefix={`lead-${lead.id}`} />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={save} loading={pending} disabled={!dirty}>
            Save changes
          </Button>
          {lead.inquiry_id && (
            <ButtonLink href={`/admin/inquiries?id=${lead.inquiry_id}`} variant="outline">
              <Inbox aria-hidden className="size-4" />
              Original inquiry
            </ButtonLink>
          )}
        </div>

        <section className="border-t border-line pt-5">
          <h3 className="font-display text-[15px] font-bold text-ink">Timeline</h3>
          <div className="mt-3 grid gap-2 rounded-card-sm bg-tint p-3">
            <div className="flex gap-2">
              <Select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value as ActivityKind)} className="h-10 w-36 text-sm">
                {(["note", "call", "email", "whatsapp", "meeting"] as const).map((value) => (
                  <option key={value} value={value}>
                    {activityLabels[value]}
                  </option>
                ))}
              </Select>
              <Button type="button" size="sm" onClick={log} disabled={pending || !note.trim()} className="ml-auto">
                Add
              </Button>
            </div>
            <Field label="What happened?" htmlFor={`note-${lead.id}`} className="[&>label]:sr-only">
              <Textarea
                id={`note-${lead.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Called, sent a quotation, agreed a site visit…"
                className="min-h-20"
              />
            </Field>
          </div>
          <ol className="mt-4 grid gap-3">
            {activities === null && <li className="text-sm text-muted">Loading…</li>}
            {activities?.length === 0 && <li className="text-sm text-muted">Nothing logged yet.</li>}
            {activities?.map((activity) => {
              const Icon = activityIcons[activity.kind] ?? StickyNote;
              return (
                <li key={activity.id} className="flex gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-tint-2 text-deep">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-muted">
                      <span className="font-semibold text-ink">{activityLabels[activity.kind]}</span> ·{" "}
                      <time dateTime={activity.created_at} title={formatDateTime(activity.created_at)}>
                        {formatAgo(activity.created_at)}
                      </time>
                    </p>
                    {activity.body && <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-line text-ink">{activity.body}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="border-t border-line pt-5">
          <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden className="size-4" />
            Delete lead
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        pending={pending}
        title="Delete this lead?"
        description="It and its timeline will be removed for good. A linked website inquiry stays in Inquiries."
        onConfirm={() =>
          startTransition(async () => {
            const result = await deleteLead(lead.id);
            if (!result.ok) return toast(result.error, "error");
            toast("Lead deleted.");
            setConfirmDelete(false);
            onClose();
            onChanged();
          })
        }
      />
    </Dialog>
  );
}
