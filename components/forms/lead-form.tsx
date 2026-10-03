"use client";

import { Check, ChevronDown, CircleAlert } from "lucide-react";
import { Fragment, useActionState, useEffect, useId, useRef, useState } from "react";
import { submitLead, type LeadState } from "@/app/actions/leads";
import { useCatalogOptions } from "@/components/forms/catalog-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { leadForms, resolveFields, type FormField, type LeadFormType } from "@/content/forms";
import { track } from "@/lib/analytics";
import { readAttribution } from "@/lib/analytics/client";
import { cn } from "@/lib/cn";

const initialState: LeadState = { status: "idle" };

/** StomDent-style underlined fields; focus thickens the rule to deep blue, errors turn it coral. */
const control =
  "block w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-base text-ink transition-[border-color,box-shadow] duration-200 hover:border-brand focus-visible:border-deep focus-visible:shadow-[inset_0_-1px_0_var(--color-deep)] focus-visible:outline-none aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-[inset_0_-1px_0_var(--color-danger)]";

function Field({
  field,
  idPrefix,
  error,
  defaultValue,
}: {
  field: FormField;
  idPrefix: string;
  error?: string;
  defaultValue: string;
}) {
  const id = `${idPrefix}-${field.name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, field.hint && hintId].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    name: field.name,
    defaultValue,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className={cn("flex flex-col gap-2", !field.half && "sm:col-span-2")}>
      <label htmlFor={id} className="text-[13px] font-semibold tracking-[0.02em] text-deep">
        {field.label}
        {!field.required && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {field.type === "select" ? (
        <div className="relative">
          <select {...shared} className={cn(control, "h-12 cursor-pointer appearance-none pr-8")}>
            <option value="">Select…</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-1 size-4 -translate-y-1/2 text-deep" />
        </div>
      ) : field.type === "textarea" ? (
        <textarea {...shared} rows={4} placeholder={field.placeholder} className={cn(control, "min-h-28 resize-y py-3")} />
      ) : (
        <input
          {...shared}
          type={field.type}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          min={field.type === "number" ? (field.min ?? 1) : undefined}
          className={cn(control, "h-12")}
        />
      )}
      {field.hint && (
        <p id={hintId} className="text-xs text-muted">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-sm text-ink">
          <CircleAlert aria-hidden className="size-4 shrink-0 text-danger" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Consecutive fields that share a section (and a sub-section within it), in the order the form asks for them. */
type FieldGroup = { section?: string; parts: { subsection?: string; fields: FormField[] }[] };

function groupFields(fields: FormField[]) {
  const groups: FieldGroup[] = [];
  for (const field of fields) {
    let group = groups.at(-1);
    if (!group || group.section !== field.section) {
      group = { section: field.section, parts: [] };
      groups.push(group);
    }
    let part = group.parts.at(-1);
    if (!part || part.subsection !== field.subsection) {
      part = { subsection: field.subsection, fields: [] };
      group.parts.push(part);
    }
    part.fields.push(field);
  }
  return groups;
}

const fieldGrid = "grid gap-x-8 gap-y-7 sm:grid-cols-2";

type LeadFormProps = { type: LeadFormType; prefill?: Record<string, string>; className?: string };

/** One purpose-specific lead form (buy, rental, corporate or service), validated on the server. */
export function LeadForm(props: LeadFormProps) {
  // Remounting under a new key clears the action state, so "Send another request" starts fresh.
  const [instance, setInstance] = useState(0);
  return <LeadFormInner key={instance} {...props} onReset={() => setInstance((n) => n + 1)} />;
}

function LeadFormInner({ type, prefill, className, onReset }: LeadFormProps & { onReset: () => void }) {
  const config = leadForms[type];
  const catalogue = useCatalogOptions();
  const groups = groupFields(resolveFields(type, catalogue));
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const uid = useId();
  const tracked = useRef<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  const attribution = useRef<HTMLInputElement>(null);
  const elapsed = useRef<HTMLInputElement>(null);
  const shownAt = useRef(0);

  // Where this visit came from goes along with the request (the admin shows it with the inquiry), and the time
  // since the form appeared lets the server ignore bots that fill it in instantly.
  useEffect(() => {
    shownAt.current = Date.now();
    if (attribution.current) attribution.current.value = JSON.stringify(readAttribution() ?? {});
  }, []);
  function stamp() {
    if (elapsed.current) elapsed.current.value = String(Date.now() - shownAt.current);
    if (attribution.current) attribution.current.value = JSON.stringify(readAttribution() ?? {});
  }

  // Once the server replies, bring the result to the visitor: the first field to fix, or the confirmation.
  // On a phone the submit button sits a long way below both, so without this nothing seems to happen.
  useEffect(() => {
    const target =
      state.status === "success"
        ? confirmation.current
        : state.status === "error"
          ? (form.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? form.current?.querySelector<HTMLElement>('[role="alert"]'))
          : null;
    if (!target) return;
    // An instant jump: the content has just changed, and an animated scroll is cut short by the smooth scroller.
    target.scrollIntoView({ block: "center", behavior: "instant" });
    target.focus({ preventScroll: true });
  }, [state]);

  useEffect(() => {
    if (state.status !== "success" || !state.reference || tracked.current === state.reference) return;
    tracked.current = state.reference;
    track("generate_lead", { lead_source: config.source, form_type: type });
  }, [state, config.source, type]);

  if (state.status === "success") {
    return (
      <div
        ref={confirmation}
        role="status"
        tabIndex={-1}
        className={cn("flex flex-col items-start gap-5 rounded-card-xl bg-tint-2 p-8 outline-none sm:p-10", className)}
      >
        <IconBadge variant="deep" size="lg" brand={false}>
          <Check />
        </IconBadge>
        <h3 className="font-display text-h3 font-bold text-ink">Thank you. We’ve received your request.</h3>
        <p className="text-muted">
          Your reference is <strong className="font-semibold text-deep">{state.reference}</strong>. {config.successNote}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="primary" onClick={onReset}>
            Send another request
          </Button>
          <ButtonLink href="/" variant="white" arrow>
            Back to home
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={form}
      action={formAction}
      onSubmit={stamp}
      noValidate
      className={cn("relative grid gap-x-8 gap-y-7 sm:grid-cols-2", className)}
    >
      <input type="hidden" name="formType" value={type} />
      <input ref={attribution} type="hidden" name="attribution" defaultValue="" />
      <input ref={elapsed} type="hidden" name="elapsed_ms" defaultValue="" />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          tabIndex={-1}
          className="flex items-start gap-2.5 rounded-chip border border-danger bg-white px-4 py-3 text-sm text-ink sm:col-span-2"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
          {state.message}
        </p>
      )}

      {groups.map((group, i) => {
        const fields = (list: FormField[]) =>
          list.map((field) => (
            <Field
              key={field.name}
              field={field}
              idPrefix={uid}
              error={state.errors?.[field.name]}
              defaultValue={state.values?.[field.name] ?? prefill?.[field.name] ?? ""}
            />
          ));
        if (!group.section) return <Fragment key={`fields-${i}`}>{group.parts.flatMap((part) => fields(part.fields))}</Fragment>;
        // A titled section (the corporate form): its own fieldset, with any sub-sections nested inside.
        return (
          <fieldset key={group.section} className={cn("min-w-0 sm:col-span-2", i > 0 && "border-t border-line pt-7")}>
            <legend className="float-left w-full font-display text-lg font-bold text-ink">{group.section}</legend>
            <div className="clear-both grid gap-7 pt-5">
              {group.parts.map((part) =>
                part.subsection ? (
                  <fieldset key={part.subsection} className="min-w-0 rounded-card bg-tint p-5 sm:p-6">
                    <legend className="float-left mb-5 inline-flex w-fit rounded-full bg-white px-3.5 py-1 text-[13px] font-semibold text-deep">
                      {part.subsection}
                    </legend>
                    <div className={cn("clear-both", fieldGrid)}>{fields(part.fields)}</div>
                  </fieldset>
                ) : (
                  <div key={part.fields[0]?.name} className={fieldGrid}>
                    {fields(part.fields)}
                  </div>
                ),
              )}
            </div>
          </fieldset>
        );
      })}

      <div className="flex flex-col gap-4 pt-2 sm:col-span-2">
        <Button type="submit" size="lg" loading={pending} arrow className="w-full">
          {pending ? "Sending…" : config.submitLabel}
        </Button>
        <p className="text-center text-xs text-muted">We’ll use your details only to respond to this request.</p>
      </div>
    </form>
  );
}
