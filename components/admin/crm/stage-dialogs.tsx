"use client";

import { useState, useTransition } from "react";
import { createLead, deleteStage, updateStage } from "@/app/actions/admin/crm";
import { draftFromLead, inputFromDraft, LeadFields, type LeadDraft } from "@/components/admin/crm/lead-fields";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Input, Select } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import { outcomeLabels } from "@/lib/admin/crm";
import type { Stage, StageOutcome } from "@/lib/supabase/types";

/** Rename a stage, or say whether reaching it means the deal is won or lost. */
export function EditStageDialog({ stage, onClose, onChanged }: { stage: Stage; onClose: () => void; onChanged: () => void }) {
  const [name, setName] = useState(stage.name);
  const [outcome, setOutcome] = useState<StageOutcome>(stage.outcome);
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open onClose={onClose} title="Edit stage">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await updateStage(stage.id, { name, outcome });
            if (!result.ok) return toast(result.error, "error");
            toast("Stage saved.");
            onClose();
            onChanged();
          });
        }}
      >
        <Field label="Name" htmlFor="stage-name">
          <Input id="stage-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required autoFocus />
        </Field>
        <Field
          label="Leads here are"
          htmlFor="stage-outcome"
          hint="Won and lost stages close the deal: they count towards sales and the win rate, and drop out of the pipeline value."
        >
          <Select id="stage-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as StageOutcome)}>
            {Object.entries(outcomeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Deleting a stage asks where its leads should go (New Leads unless chosen otherwise). */
export function DeleteStageDialog({
  stage,
  stages,
  leadCount,
  onClose,
  onChanged,
}: {
  stage: Stage;
  stages: Stage[];
  leadCount: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const others = stages.filter((item) => item.id !== stage.id);
  const [target, setTarget] = useState(others.find((item) => item.is_locked)?.id ?? others[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  return (
    <ConfirmDialog
      open
      onClose={onClose}
      pending={pending}
      title={`Delete “${stage.name}”?`}
      description={leadCount === 0 ? "The stage is empty, so nothing else changes." : undefined}
      confirmLabel="Delete stage"
      onConfirm={() =>
        startTransition(async () => {
          const result = await deleteStage(stage.id, leadCount > 0 ? target : null);
          if (!result.ok) return toast(result.error, "error");
          toast("Stage deleted.");
          onClose();
          onChanged();
        })
      }
    >
      {leadCount > 0 && (
        <Field label={`Move its ${leadCount} ${leadCount === 1 ? "lead" : "leads"} to`} htmlFor="stage-target">
          <Select id="stage-target" value={target} onChange={(e) => setTarget(e.target.value)}>
            {others.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </ConfirmDialog>
  );
}

/** A new lead, added by hand (a phone call, a walk-in, a referral). */
export function NewLeadDialog({
  stages,
  defaultStageId,
  onClose,
  onCreated,
}: {
  stages: Stage[];
  defaultStageId: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [draft, setDraft] = useState<LeadDraft>(() => ({ ...draftFromLead(null, defaultStageId), source: "phone" }));
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open side onClose={onClose} title="Add a lead" description="It goes to the top of the stage you choose.">
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await createLead(inputFromDraft(draft));
            if (!result.ok) return toast(result.error, "error");
            toast("Lead added.");
            onClose();
            onCreated(result.data!.id);
          });
        }}
      >
        <LeadFields draft={draft} onChange={setDraft} stages={stages} showStage idPrefix="new-lead" />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending} disabled={!draft.name.trim()}>
            Add lead
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
