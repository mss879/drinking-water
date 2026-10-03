"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deletePart, movePart, savePart, type PartInput } from "@/app/actions/admin/website";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { ImageField } from "@/components/admin/website/image-field";
import { RowActions } from "@/components/admin/website/row-actions";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { partCategories } from "@/content/parts";
import { formatLKR } from "@/lib/format";
import type { PartRow } from "@/lib/supabase/types";

type Editing = { id: string | null; form: PartInput };

const blank = (category: string): PartInput => ({ category, name: "", description: "", image_url: null, price: "", life: "", published: true });

const iconButton = "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-deep hover:text-deep";

/** Filters, spare parts and accessories, grouped as on the website; each item opens in a dialog to edit. */
export function PartsManager({ parts }: { parts: PartRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<PartRow | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof PartInput>(key: K, value: PartInput[K]) =>
    setEditing((current) => (current ? { ...current, form: { ...current.form, [key]: value } } : current));

  function save() {
    if (!editing) return;
    startTransition(async () => {
      const result = await savePart(editing.id, editing.form);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Saved.");
      setEditing(null);
      router.refresh();
    });
  }

  function remove() {
    if (!removing) return;
    startTransition(async () => {
      const result = await deletePart(removing.id);
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Deleted.");
      setRemoving(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="grid gap-5">
        {partCategories.map((category) => {
          const items = parts.filter((part) => part.category === category.id);
          return (
            <section key={category.id} aria-labelledby={`cat-${category.id}`} className="card-line">
              <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
                <div className="flex items-center gap-3">
                  <BrandIcon name={category.icon} size={40} />
                  <div>
                    <h2 id={`cat-${category.id}`} className="font-display text-[17px] font-bold text-ink">
                      {category.title}
                    </h2>
                    <p className="text-sm text-muted">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing({ id: null, form: blank(category.id) })}>
                  <Plus aria-hidden className="size-4" /> Add
                </Button>
              </header>
              <ul className="grid gap-2 p-5 sm:p-6">
                {items.length === 0 && <li className="rounded-card-sm border border-dashed border-line p-4 text-sm text-muted">Nothing listed yet.</li>}
                {items.map((part, i) => (
                  <li key={part.id} className="flex flex-col gap-3 rounded-card-sm border border-line p-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-card-sm bg-tint-2">
                        {part.image_url ? <Image src={part.image_url} alt="" fill sizes="56px" className="object-contain p-1" /> : <BrandIcon name={category.icon} size={32} />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-bold text-ink">{part.name}</span>
                          {!part.published && <Badge tone="muted">Hidden</Badge>}
                        </span>
                        <span className="block text-sm text-muted">
                          {part.price ? formatLKR(part.price) : "Ask for a price"}
                          {part.life_months && ` · typical life ${part.life_months} months`}
                          {part.description && ` · ${part.description}`}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RowActions
                        name={part.name}
                        first={i === 0}
                        last={i === items.length - 1}
                        onMove={movePart.bind(null, part.id)}
                      />
                      <button
                        type="button"
                        className={iconButton}
                        aria-label={`Edit ${part.name}`}
                        onClick={() =>
                          setEditing({
                            id: part.id,
                            form: {
                              category: part.category,
                              name: part.name,
                              description: part.description,
                              image_url: part.image_url,
                              price: part.price ? String(part.price) : "",
                              life: part.life_months ? String(part.life_months) : "",
                              published: part.published,
                            },
                          })
                        }
                      >
                        <Pencil aria-hidden className="size-4" />
                      </button>
                      <button type="button" className={iconButton} aria-label={`Delete ${part.name}`} onClick={() => setRemoving(part)}>
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? "Edit item" : "Add an item"}>
        {editing && (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Field label="Category" htmlFor="part-cat">
              <Select id="part-cat" value={editing.form.category} onChange={(event) => set("category", event.target.value)}>
                {partCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Name" htmlFor="part-name">
              <Input id="part-name" required value={editing.form.name} onChange={(event) => set("name", event.target.value)} />
            </Field>
            <Field label="Short description" htmlFor="part-desc">
              <Textarea id="part-desc" rows={2} className="min-h-20" value={editing.form.description} onChange={(event) => set("description", event.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (LKR, excluding taxes)" htmlFor="part-price" hint="Leave empty to show “Ask for a price”.">
                <Input id="part-price" inputMode="numeric" value={editing.form.price} onChange={(event) => set("price", event.target.value)} />
              </Field>
              {editing.form.category === "filters" && (
                <Field label="Typical life (months)" htmlFor="part-life" hint="Optional. Shown as a guide.">
                  <Input id="part-life" inputMode="numeric" value={editing.form.life} onChange={(event) => set("life", event.target.value)} />
                </Field>
              )}
            </div>
            <ImageField label="Photo (optional)" value={editing.form.image_url} onChange={(url) => set("image_url", url)} folder="parts" aspect="aspect-[3/2]" />
            <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
              <input type="checkbox" checked={editing.form.published} onChange={(event) => set("published", event.target.checked)} className="size-4 accent-[var(--color-deep)]" />
              Show on the website
            </label>
            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                {editing.id ? "Save" : "Add"}
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
        title={`Delete ${removing?.name ?? "this item"}?`}
        description="It disappears from the Filters, parts & accessories page."
      />
    </>
  );
}
