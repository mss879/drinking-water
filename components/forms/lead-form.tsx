"use client";

import { Check, ChevronDown } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitLead, type LeadState } from "@/app/actions/leads";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { leadForms, type FormField, type LeadFormType } from "@/content/forms";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const initialState: LeadState = { status: "idle" };

const control =
  "block w-full rounded-chip border border-line bg-white px-4 text-[15px] text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-subtle hover:border-ink/25 focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15 focus-visible:outline-none aria-[invalid=true]:border-danger";

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
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {field.label}
        {!field.required && <span className="font-normal text-subtle"> (optional)</span>}
      </label>
      {field.type === "select" ? (
        <div className="relative">
          <select {...shared} className={cn(control, "h-12 cursor-pointer appearance-none pr-11")}>
            <option value="">Select…</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-subtle" />
        </div>
      ) : field.type === "textarea" ? (
        <textarea {...shared} rows={4} placeholder={field.placeholder} className={cn(control, "min-h-28 py-3")} />
      ) : (
        <input
          {...shared}
          type={field.type}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          min={field.type === "number" ? 1 : undefined}
          className={cn(control, "h-12")}
        />
      )}
      {field.hint && (
        <p id={hintId} className="text-xs text-subtle">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type LeadFormProps = { type: LeadFormType; prefill?: Record<string, string>; className?: string };

/** One purpose-specific lead form (buy, rental, corporate or service), validated on the server. */
export function LeadForm(props: LeadFormProps) {
  // Remounting under a new key clears the action state, so "Send another request" starts fresh.
  const [instance, setInstance] = useState(0);
  return <LeadFormInner key={instance} {...props} onReset={() => setInstance((n) => n + 1)} />;
}

function LeadFormInner({ type, prefill, className, onReset }: LeadFormProps & { onReset: () => void }) {
  const config = leadForms[type];
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const uid = useId();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (state.status !== "success" || !state.reference || tracked.current === state.reference) return;
    tracked.current = state.reference;
    track("generate_lead", { lead_source: config.source, form_type: type });
  }, [state, config.source, type]);

  if (state.status === "success") {
    return (
      <div role="status" className={cn("flex flex-col items-start gap-5 rounded-card-xl bg-pastel p-8 sm:p-10", className)}>
        <IconBadge variant="ocean" size="lg">
          <Check />
        </IconBadge>
        <h3 className="text-h3 font-medium text-ink">Thank you. We’ve received your request.</h3>
        <p className="text-muted">
          Your reference is <strong className="font-medium text-ink">{state.reference}</strong>. {config.successNote}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="dark" onClick={onReset}>
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
    <form action={formAction} noValidate className={cn("relative grid gap-5 sm:grid-cols-2", className)}>
      <input type="hidden" name="formType" value={type} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-chip border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger sm:col-span-2">
          {state.message}
        </p>
      )}

      {config.fields.map((field) => (
        <Field
          key={field.name}
          field={field}
          idPrefix={uid}
          error={state.errors?.[field.name]}
          defaultValue={state.values?.[field.name] ?? prefill?.[field.name] ?? ""}
        />
      ))}

      <div className="flex flex-col-reverse gap-4 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-subtle">We’ll use your details only to respond to this request.</p>
        <Button type="submit" size="lg" loading={pending} arrow>
          {pending ? "Sending…" : config.submitLabel}
        </Button>
      </div>
    </form>
  );
}
