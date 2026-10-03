"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Input, Textarea } from "@/components/admin/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const iconButton =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-tint hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

function swap<T>(list: T[], from: number, to: number) {
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** A short list of single lines (highlights, temperatures, phone numbers): edit, reorder, add, remove. */
export function TextListEditor({
  label,
  items,
  onChange,
  placeholder,
  max = 8,
  addLabel = "Add",
  hint,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  max?: number;
  addLabel?: string;
  hint?: string;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-semibold text-ink">{label}</legend>
      <ul className="grid gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <Input
              value={item}
              placeholder={placeholder}
              aria-label={`${label} ${i + 1}`}
              onChange={(event) => onChange(items.map((value, j) => (j === i ? event.target.value : value)))}
            />
            <button type="button" className={iconButton} aria-label="Move up" disabled={i === 0} onClick={() => onChange(swap(items, i, i - 1))}>
              <ArrowUp aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label="Move down"
              disabled={i === items.length - 1}
              onClick={() => onChange(swap(items, i, i + 1))}
            >
              <ArrowDown aria-hidden className="size-4" />
            </button>
            <button type="button" className={iconButton} aria-label={`Remove ${item || "line"}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <X aria-hidden className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      {items.length < max && (
        <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => onChange([...items, ""])}>
          <Plus aria-hidden className="size-4" /> {addLabel}
        </Button>
      )}
      {hint && <p className="text-[13px] text-muted">{hint}</p>}
    </fieldset>
  );
}

export type Card = { title: string; body: string };

/** A list of title + text cards (features, "who it's for"): edit, reorder, add, remove. */
export function CardListEditor({
  label,
  items,
  onChange,
  max = 8,
  addLabel = "Add",
  hint,
}: {
  label: string;
  items: Card[];
  onChange: (items: Card[]) => void;
  max?: number;
  addLabel?: string;
  hint?: string;
}) {
  const update = (i: number, patch: Partial<Card>) => onChange(items.map((card, j) => (j === i ? { ...card, ...patch } : card)));
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-semibold text-ink">{label}</legend>
      <ol className="grid gap-3">
        {items.map((card, i) => (
          <li key={i} className={cn("grid gap-2 rounded-card-sm border border-line bg-white p-3")}>
            <div className="flex items-center gap-1.5">
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-tint-2 text-xs font-bold text-deep">
                {i + 1}
              </span>
              <Input value={card.title} placeholder="Title" aria-label={`${label} ${i + 1}: title`} onChange={(event) => update(i, { title: event.target.value })} />
              <button type="button" className={iconButton} aria-label="Move up" disabled={i === 0} onClick={() => onChange(swap(items, i, i - 1))}>
                <ArrowUp aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label="Move down"
                disabled={i === items.length - 1}
                onClick={() => onChange(swap(items, i, i + 1))}
              >
                <ArrowDown aria-hidden className="size-4" />
              </button>
              <button type="button" className={iconButton} aria-label={`Remove ${card.title || "card"}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <X aria-hidden className="size-4" />
              </button>
            </div>
            <Textarea
              value={card.body}
              placeholder="One or two sentences"
              aria-label={`${label} ${i + 1}: text`}
              rows={2}
              className="min-h-16"
              onChange={(event) => update(i, { body: event.target.value })}
            />
          </li>
        ))}
      </ol>
      {items.length < max && (
        <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => onChange([...items, { title: "", body: "" }])}>
          <Plus aria-hidden className="size-4" /> {addLabel}
        </Button>
      )}
      {hint && <p className="text-[13px] text-muted">{hint}</p>}
    </fieldset>
  );
}
