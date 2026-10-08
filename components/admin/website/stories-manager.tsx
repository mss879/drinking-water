"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BookOpenText, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteStory, moveStory, saveStory, setStoryPublished, type StoryInput } from "@/app/actions/admin/stories";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Input, Textarea } from "@/components/admin/ui/field";
import { EmptyState } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { RowActions } from "@/components/admin/website/row-actions";
import { Button } from "@/components/ui/button";
import type { CaseStudyRow } from "@/lib/supabase/types";

type Editing = { id: string | null; form: StoryInput };
type Part = "challenge" | "requirement" | "solution" | "implementation" | "support" | "result";

/** The story's six parts, in the card's order and with the card's headings. */
const parts: { key: Part; label: string; hint?: string }[] = [
  { key: "challenge", label: "Challenge", hint: "What the client was dealing with." },
  { key: "requirement", label: "Requirement", hint: "What they needed." },
  { key: "solution", label: "LUSAKO solution", hint: "Start with Rental or Purchase and “ · ”, for example Rental · PureFlow UF for city branches." },
  { key: "implementation", label: "Implementation" },
  { key: "support", label: "Ongoing support" },
  { key: "result", label: "Result", hint: "Shown highlighted at the end of the story." },
];

const blank: StoryInput = {
  sample: false,
  industry: "",
  location: "",
  model: "",
  challenge: "",
  requirement: "",
  solution: "",
  implementation: "",
  support: "",
  result: "",
  published: true,
};

const iconButton =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-deep hover:text-deep";

const approval = "Name a client only with their written approval. Until then, describe the industry and mark the story as a sample.";

/** The pill on a story's card: its own, or the start of the solution (as the Our clients page works it out). */
const pillOf = (story: Pick<StoryInput, "model" | "solution">) => story.model.trim() || story.solution.split(" · ")[0].trim();

/**
 * The client stories on Our clients, in their order there; each opens in a side sheet to edit. `steps` (the six part
 * names) and `samplePill` are the card's wording as the page shows it (Page text can rename them).
 */
export function StoriesManager({ stories, steps = [], samplePill = "Sample story" }: { stories: CaseStudyRow[]; steps?: string[]; samplePill?: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<CaseStudyRow | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof StoryInput>(key: K, value: StoryInput[K]) =>
    setEditing((current) => (current ? { ...current, form: { ...current.form, [key]: value } } : current));
  const add = () => setEditing({ id: null, form: blank });

  function save() {
    if (!editing) return;
    startTransition(async () => {
      const result = await saveStory(editing.id, editing.form);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Saved.");
      setEditing(null);
      router.refresh();
    });
  }

  function remove() {
    if (!removing) return;
    startTransition(async () => {
      const result = await deleteStory(removing.id);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Deleted.");
      setRemoving(null);
      router.refresh();
    });
  }

  return (
    <>
      {stories.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button type="button" size="sm" onClick={add}>
            <Plus aria-hidden className="size-4" /> Add a story
          </Button>
        </div>
      )}

      {stories.length === 0 ? (
        <div className="card-line">
          <EmptyState icon={<BookOpenText aria-hidden />} title="No client stories yet" action={<Button type="button" size="sm" onClick={add}>Add the first story</Button>}>
            {approval}
          </EmptyState>
        </div>
      ) : (
        <ol className="grid gap-3">
          {stories.map((story, i) => {
            const pill = pillOf(story);
            return (
              <li key={story.id} className="card-line flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <span aria-hidden className="font-sans text-3xl leading-none font-extralight tracking-[-0.04em] text-brand sm:w-12 sm:shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-bold text-ink">{story.industry}</span>
                    {story.sample && <Badge>Sample story</Badge>}
                    {!story.published && <Badge tone="muted">Hidden</Badge>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                    {story.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden className="size-3.5 text-brand" />
                        {story.location}
                      </span>
                    )}
                    {pill && <span>{story.location && "· "}{pill}</span>}
                  </p>
                  {story.result && <p className="mt-1 line-clamp-1 text-[13px] text-ink">{story.result}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <RowActions
                    name={story.industry}
                    published={story.published}
                    first={i === 0}
                    last={i === stories.length - 1}
                    onMove={moveStory.bind(null, story.id)}
                    onPublish={setStoryPublished.bind(null, story.id)}
                  />
                  <button
                    type="button"
                    className={iconButton}
                    aria-label={`Edit the ${story.industry} story`}
                    onClick={() =>
                      setEditing({
                        id: story.id,
                        form: {
                          sample: story.sample,
                          industry: story.industry,
                          location: story.location,
                          model: story.model,
                          challenge: story.challenge,
                          requirement: story.requirement,
                          solution: story.solution,
                          implementation: story.implementation,
                          support: story.support,
                          result: story.result,
                          published: story.published,
                        },
                      })
                    }
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                  <button type="button" className={iconButton} aria-label={`Delete the ${story.industry} story`} onClick={() => setRemoving(story)}>
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} side title={editing?.id ? "Edit story" : "Add a story"} description={approval}>
        {editing && (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Field label="Industry" htmlFor="story-industry" hint={`${editing.form.industry.trim().length}/80 · the story’s title, for example Hospitality`}>
              <Input id="story-industry" required maxLength={80} value={editing.form.industry} onChange={(event) => set("industry", event.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location" htmlFor="story-location" hint="For example Southern Province.">
                <Input id="story-location" maxLength={80} value={editing.form.location} onChange={(event) => set("location", event.target.value)} />
              </Field>
              <Field label="Pill (optional)" htmlFor="story-model" hint="Leave empty to use the start of the solution, before “ · ”.">
                <Input
                  id="story-model"
                  maxLength={60}
                  placeholder={editing.form.solution.split(" · ")[0].trim() || "Rental"}
                  value={editing.form.model}
                  onChange={(event) => set("model", event.target.value)}
                />
              </Field>
            </div>
            {parts.map((part, i) => (
              <Field
                key={part.key}
                label={steps[i] || part.label}
                htmlFor={`story-${part.key}`}
                hint={`${editing.form[part.key].trim().length}/400${part.hint ? ` · ${part.hint}` : ""}`}
              >
                <Textarea
                  id={`story-${part.key}`}
                  rows={2}
                  maxLength={400}
                  className="min-h-20"
                  value={editing.form[part.key]}
                  onChange={(event) => set(part.key, event.target.value)}
                />
              </Field>
            ))}
            <fieldset className="grid gap-2.5">
              <legend className="sr-only">Options</legend>
              <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink">
                <input type="checkbox" checked={editing.form.sample} onChange={(event) => set("sample", event.target.checked)} className="mt-1 size-4 accent-[var(--color-deep)]" />
                <span>
                  Sample story
                  <span className="block text-[13px] text-muted">
                    For an example rather than a named client. The card shows a “{samplePill}” tag and the page says samples will be replaced
                    with approved client stories.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
                <input type="checkbox" checked={editing.form.published} onChange={(event) => set("published", event.target.checked)} className="size-4 accent-[var(--color-deep)]" />
                Show on the website
              </label>
            </fieldset>
            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                {editing.id ? "Save" : "Add story"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        pending={pending}
        title={`Delete the ${removing?.industry ?? ""} story?`}
        description="It disappears from the Our clients page. To take it down for a while, hide it instead."
      />
    </>
  );
}
