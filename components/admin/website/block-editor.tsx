"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, X } from "lucide-react";
import { resetCopy, saveCopy } from "@/app/actions/admin/copy";
import { Badge } from "@/components/admin/ui/badge";
import { Input, Textarea } from "@/components/admin/ui/field";
import { Panel } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import { checkField, type AnyBlock, type CardsField, type CopyData, type CopyValue, type Field, type ListField, type TextField } from "@/content/copy/schema";
import { cn } from "@/lib/cn";

const iconButton =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-tint hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

function swap<T>(list: T[], from: number, to: number) {
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

function guidance(field: TextField | ListField) {
  const notes: string[] = [];
  if (field.marks === "one") notes.push("Wrap the highlighted words in *asterisks*.");
  if (field.marks === "optional") notes.push("You can wrap a few words in *asterisks* to highlight them.");
  if (field.tokens?.length) notes.push(`Keep ${field.tokens.join(" and ")}: the website fills ${field.tokens.length > 1 ? "them" : "it"} in.`);
  return notes.join(" ");
}

/** A text input with its character count, turning red past the limit. */
function TextInput({
  field,
  value,
  onChange,
  label,
  id,
}: {
  field: TextField | ListField;
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
}) {
  const multiline = field.kind === "text" && field.multiline;
  const over = value.trim().length > field.max;
  const counter = (
    <span className={cn("shrink-0 text-xs tabular-nums", over ? "font-semibold text-ink" : "text-muted")}>
      {over && <span aria-hidden className="mr-1 inline-block size-1.5 rounded-full bg-danger align-middle" />}
      {value.trim().length}/{field.max}
    </span>
  );
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {multiline ? (
        <Textarea id={id} value={value} aria-label={label} aria-invalid={over || undefined} rows={3} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input id={id} value={value} aria-label={label} aria-invalid={over || undefined} onChange={(event) => onChange(event.target.value)} />
      )}
      <div className="flex justify-end">{counter}</div>
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-[13px] text-ink">
      <span aria-hidden className="mr-1.5 inline-block size-1.5 rounded-full bg-danger align-middle" />
      {error}
    </p>
  );
}

function ListEditor({ field, value, onChange, id }: { field: ListField; value: string[]; onChange: (value: string[]) => void; id: string }) {
  const [min, max] = field.count;
  const fixed = min === max;
  const name = field.itemLabel ?? "Line";
  const reorder = field.reorder !== false;
  return (
    <ul className="grid gap-1.5">
      {value.map((line, i) => (
        <li key={i} className="grid gap-1">
          {field.itemNames?.[i] && <span className="text-xs font-semibold text-deep">{field.itemNames[i]}</span>}
          <div className="flex items-start gap-1.5">
            <TextInput
              field={field}
              value={line}
              id={`${id}-${i}`}
              label={`${field.label}: ${field.itemNames?.[i] ?? `${name.toLowerCase()} ${i + 1}`}`}
              onChange={(next) => onChange(value.map((old, j) => (j === i ? next : old)))}
            />
            {reorder && (
              <>
                <button type="button" className={iconButton} aria-label={`Move ${name.toLowerCase()} ${i + 1} up`} disabled={i === 0} onClick={() => onChange(swap(value, i, i - 1))}>
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button type="button" className={iconButton} aria-label={`Move ${name.toLowerCase()} ${i + 1} down`} disabled={i === value.length - 1} onClick={() => onChange(swap(value, i, i + 1))}>
                  <ArrowDown aria-hidden className="size-4" />
                </button>
              </>
            )}
            {!fixed && (
              <button type="button" className={iconButton} aria-label={`Remove ${name.toLowerCase()} ${i + 1}`} disabled={value.length <= min} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
        </li>
      ))}
      {!fixed && value.length < max && (
        <li>
          <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => onChange([...value, ""])}>
            <Plus aria-hidden className="size-4" /> Add {name.toLowerCase()}
          </Button>
        </li>
      )}
    </ul>
  );
}

function CardsEditor({
  field,
  value,
  onChange,
  id,
}: {
  field: CardsField;
  value: Record<string, string>[];
  onChange: (value: Record<string, string>[]) => void;
  id: string;
}) {
  const [min, max] = field.count;
  const fixed = min === max;
  const name = field.itemLabel ?? "Item";
  const reorder = field.reorder !== false;
  const entries = Object.entries(field.item);
  const empty = () => Object.fromEntries(entries.map(([key]) => [key, ""]));
  return (
    <ol className="grid gap-3">
      {value.map((card, i) => (
        <li key={i} className="grid gap-3 rounded-card-sm border border-line bg-white p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <span className="flex-1 text-[13px] font-semibold text-deep">{field.itemNames?.[i] ?? `${name} ${i + 1}`}</span>
            {reorder && (
              <>
                <button type="button" className={iconButton} aria-label={`Move ${name.toLowerCase()} ${i + 1} up`} disabled={i === 0} onClick={() => onChange(swap(value, i, i - 1))}>
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button type="button" className={iconButton} aria-label={`Move ${name.toLowerCase()} ${i + 1} down`} disabled={i === value.length - 1} onClick={() => onChange(swap(value, i, i + 1))}>
                  <ArrowDown aria-hidden className="size-4" />
                </button>
              </>
            )}
            {!fixed && (
              <button type="button" className={iconButton} aria-label={`Remove ${name.toLowerCase()} ${i + 1}`} disabled={value.length <= min} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
          {entries.map(([key, def]) => (
            <div key={key} className="grid gap-1">
              <label htmlFor={`${id}-${i}-${key}`} className="text-[13px] font-semibold text-ink">
                {def.label}
              </label>
              <TextInput
                field={def}
                value={card[key] ?? ""}
                id={`${id}-${i}-${key}`}
                label={`${field.itemNames?.[i] ?? `${name} ${i + 1}`}: ${def.label}`}
                onChange={(next) => onChange(value.map((old, j) => (j === i ? { ...old, [key]: next } : old)))}
              />
              {(def.hint || guidance(def)) && <p className="text-[13px] text-muted">{[def.hint, guidance(def)].filter(Boolean).join(" ")}</p>}
            </div>
          ))}
        </li>
      ))}
      {!fixed && value.length < max && (
        <li>
          <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => onChange([...value, empty()])}>
            <Plus aria-hidden className="size-4" /> Add {name.toLowerCase()}
          </Button>
        </li>
      )}
    </ol>
  );
}

function FieldEditor({ field, value, onChange, error, id }: { field: Field; value: CopyValue; onChange: (value: CopyValue) => void; error?: string; id: string }) {
  const notes = field.kind === "cards" ? "" : guidance(field);
  const hint = [field.hint, notes].filter(Boolean).join(" ");
  const counts = field.kind === "text" ? null : field.count[0] === field.count[1] ? `${field.count[0]} exactly` : `${field.count[0]} to ${field.count[1]}`;
  return (
    <fieldset className="grid min-w-0 gap-2">
      <legend className="mb-1 flex w-full flex-wrap items-baseline justify-between gap-x-3 text-[13px] font-semibold text-ink">
        {field.kind === "text" ? <label htmlFor={id}>{field.label}</label> : field.label}
        {counts && <span className="text-xs font-normal text-muted">{counts}</span>}
      </legend>
      {field.kind === "text" && <TextInput field={field} value={value as string} id={id} label={field.label} onChange={onChange} />}
      {field.kind === "list" && <ListEditor field={field} value={value as string[]} id={id} onChange={onChange} />}
      {field.kind === "cards" && <CardsEditor field={field} value={value as Record<string, string>[]} id={id} onChange={onChange} />}
      {hint && <p className="text-[13px] text-muted">{hint}</p>}
      <FieldError error={error} />
    </fieldset>
  );
}

/**
 * One block of page text in the admin, built from its declaration (content/copy). Each field shows its limit and is
 * checked as you type; Save stores only what differs from the website's own wording, and "Use the original" removes it.
 */
export function BlockEditor({ block, initial, edited }: { block: AnyBlock; initial: CopyData; edited: boolean }) {
  const router = useRouter();
  const uid = useId();
  const [form, setForm] = useState<CopyData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const fields = Object.entries(block.fields) as [string, Field][];

  function update(name: string, value: CopyValue) {
    setForm((current) => ({ ...current, [name]: value }));
    setDirty(true);
    if (errors[name]) {
      const checked = checkField(block.fields[name] as Field, value);
      setErrors((current) => {
        const next = { ...current };
        if (checked.ok) delete next[name];
        else next[name] = checked.error;
        return next;
      });
    }
  }

  function save() {
    const local: Record<string, string> = {};
    for (const [name, field] of fields) {
      const checked = checkField(field, form[name]);
      if (!checked.ok) local[name] = checked.error;
    }
    setErrors(local);
    if (Object.keys(local).length) return toast("Some of the text needs a change before it can be saved.", "error");
    startTransition(async () => {
      const result = await saveCopy(block.key, form);
      if (!result.ok) {
        if (result.fields) setErrors(result.fields);
        return toast(result.error, "error");
      }
      setDirty(false);
      toast(result.message);
      router.refresh();
    });
  }

  function reset() {
    startTransition(async () => {
      const result = await resetCopy(block.key);
      if (!result.ok) return toast(result.error, "error");
      setForm(block.defaults);
      setErrors({});
      setDirty(false);
      toast(result.message);
      router.refresh();
    });
  }

  return (
    <Panel
      title={
        <span className="flex flex-wrap items-center gap-2">
          {block.label}
          {edited ? <Badge tone="solid">Edited</Badge> : <Badge tone="muted">Original</Badge>}
          {dirty && <Badge tone="soft">Unsaved</Badge>}
        </span>
      }
      description={block.description}
    >
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        {fields.map(([name, field]) => (
          <FieldEditor key={name} field={field} value={form[name]} error={errors[name]} id={`${uid}-${name}`} onChange={(value) => update(name, value)} />
        ))}
        <div className="flex flex-wrap gap-2 border-t border-line pt-5">
          <Button type="submit" size="sm" loading={pending} disabled={!dirty && !pending}>
            Save
          </Button>
          {edited && (
            <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={reset}>
              <RotateCcw aria-hidden className="size-4" /> Use the original
            </Button>
          )}
        </div>
      </form>
    </Panel>
  );
}
