"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Info, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteFaq, moveFaq, saveFaq, setFaqPublished, type FaqInput } from "@/app/actions/admin/faqs";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { RowActions } from "@/components/admin/website/row-actions";
import { Button } from "@/components/ui/button";
import { faqTopics, type FaqTopic } from "@/content/faqs";
import type { FaqRow } from "@/lib/supabase/types";

type Editing = { id: string | null; key: string | null; form: FaqInput };

/** The topics the admin edits; the AMC questions are worked out from the AMC plans. */
const topics = faqTopics.filter((topic) => topic.id !== "amc");
const amc = faqTopics.find((topic) => topic.id === "amc");

const blank = (topic: string): FaqInput => ({ topic, question: "", answer: "", on_home: false, on_corporate: false, published: true });

const iconButton =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-deep hover:text-deep";

const checkbox = "flex cursor-pointer items-center gap-3 text-[15px] text-ink";

/**
 * The questions and answers, grouped by topic as on the FAQ page; each opens in a dialog to edit. `labels` are the
 * topic names as the FAQ page shows them (Page text can rename them).
 */
export function FaqsManager({ faqs, labels = {} }: { faqs: FaqRow[]; labels?: Partial<Record<FaqTopic, string>> }) {
  const router = useRouter();
  const labelOf = (topic: { id: FaqTopic; label: string }) => labels[topic.id] || topic.label;
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<FaqRow | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof FaqInput>(key: K, value: FaqInput[K]) =>
    setEditing((current) => (current ? { ...current, form: { ...current.form, [key]: value } } : current));

  function save() {
    if (!editing) return;
    startTransition(async () => {
      const result = await saveFaq(editing.id, editing.form);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Saved.");
      setEditing(null);
      router.refresh();
    });
  }

  function remove() {
    if (!removing) return;
    startTransition(async () => {
      const result = await deleteFaq(removing.id);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Deleted.");
      setRemoving(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="grid gap-5">
        {topics.map((topic) => {
          const items = faqs.filter((faq) => faq.topic === topic.id);
          return (
            <section key={topic.id} aria-labelledby={`topic-${topic.id}`} className="card-line">
              <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
                <div>
                  <h2 id={`topic-${topic.id}`} className="font-display text-[17px] font-bold text-ink">
                    {labelOf(topic)}
                  </h2>
                  <p className="text-sm text-muted">
                    {items.length} {items.length === 1 ? "question" : "questions"}
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing({ id: null, key: null, form: blank(topic.id) })}>
                  <Plus aria-hidden className="size-4" /> Add a question
                </Button>
              </header>
              <ul className="grid gap-2 p-5 sm:p-6">
                {items.length === 0 && <li className="rounded-card-sm border border-dashed border-line p-4 text-sm text-muted">No questions yet.</li>}
                {items.map((faq, i) => (
                  <li key={faq.id} className="flex flex-col gap-3 rounded-card-sm border border-line p-3 sm:flex-row sm:items-center sm:p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-ink">{faq.question}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{faq.answer}</p>
                      {(!faq.published || faq.on_home || faq.on_corporate || faq.key) && (
                        <p className="mt-2 flex flex-wrap gap-1.5">
                          {!faq.published && <Badge tone="muted">Hidden</Badge>}
                          {faq.on_home && <Badge>Home page</Badge>}
                          {faq.on_corporate && <Badge>Corporate hydration</Badge>}
                          {faq.key && <Badge tone="outline">On every product page</Badge>}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RowActions
                        name={faq.question}
                        published={faq.published}
                        first={i === 0}
                        last={i === items.length - 1}
                        onMove={moveFaq.bind(null, faq.id)}
                        onPublish={setFaqPublished.bind(null, faq.id)}
                      />
                      <button
                        type="button"
                        className={iconButton}
                        aria-label={`Edit “${faq.question}”`}
                        onClick={() =>
                          setEditing({
                            id: faq.id,
                            key: faq.key,
                            form: {
                              topic: faq.topic,
                              question: faq.question,
                              answer: faq.answer,
                              on_home: faq.on_home,
                              on_corporate: faq.on_corporate,
                              published: faq.published,
                            },
                          })
                        }
                      >
                        <Pencil aria-hidden className="size-4" />
                      </button>
                      {!faq.key && (
                        <button type="button" className={iconButton} aria-label={`Delete “${faq.question}”`} onClick={() => setRemoving(faq)}>
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section aria-labelledby="topic-amc" className="card-line flex gap-4 p-5 sm:p-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint-2 text-deep">
            <Info aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="topic-amc" className="font-display text-[17px] font-bold text-ink">
              {amc && labelOf(amc)}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              These questions are written from the AMC plans, so their prices, visits and discounts always match the AMC page. To change
              them, change the plans in{" "}
              <Link href="/admin/amc" className="font-semibold text-deep underline-offset-2 hover:underline">
                AMC plans
              </Link>
              .
            </p>
          </div>
        </section>
      </div>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? "Edit question" : "Add a question"}>
        {editing && (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            {editing.key && (
              <p className="rounded-card-sm bg-tint px-3.5 py-3 text-sm text-ink">
                Every product page repeats this answer, so it can be edited but not deleted.
              </p>
            )}
            <Field label="Topic" htmlFor="faq-topic">
              <Select id="faq-topic" value={editing.form.topic} onChange={(event) => set("topic", event.target.value)}>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {labelOf(topic)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Question" htmlFor="faq-question" hint={`${editing.form.question.trim().length}/200`}>
              <Input id="faq-question" required maxLength={200} value={editing.form.question} onChange={(event) => set("question", event.target.value)} />
            </Field>
            <Field label="Answer" htmlFor="faq-answer" hint={`${editing.form.answer.trim().length}/1200 · one paragraph of plain text`}>
              <Textarea id="faq-answer" required rows={6} maxLength={1200} value={editing.form.answer} onChange={(event) => set("answer", event.target.value)} />
            </Field>
            <fieldset className="grid gap-2.5">
              <legend className="mb-1.5 text-[13px] font-semibold text-ink">Where it shows</legend>
              <label className={checkbox}>
                <input type="checkbox" checked={editing.form.published} onChange={(event) => set("published", event.target.checked)} className="size-4 accent-[var(--color-deep)]" />
                Show on the website
              </label>
              <label className={checkbox}>
                <input type="checkbox" checked={editing.form.on_home} onChange={(event) => set("on_home", event.target.checked)} className="size-4 accent-[var(--color-deep)]" />
                Show on the home page
              </label>
              <label className={checkbox}>
                <input
                  type="checkbox"
                  checked={editing.form.on_corporate}
                  onChange={(event) => set("on_corporate", event.target.checked)}
                  className="size-4 accent-[var(--color-deep)]"
                />
                Show on Corporate hydration
              </label>
              <p className="text-[13px] text-muted">The FAQ page always lists it under its topic while it’s on the website.</p>
            </fieldset>
            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                {editing.id ? "Save" : "Add question"}
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
        title="Delete this question?"
        description={removing ? `“${removing.question}” disappears from the website. To take it down for a while, hide it instead.` : undefined}
      />
    </>
  );
}
