import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/** A comparison value: true is a tick, false a dash, text a short qualifier. */
export type CompareValue = boolean | string;

/** A tick, a dash or a short qualifier, with words for screen readers. `mark` adds a footnote sign, e.g. "*". */
export function CompareCell({ value, mark, dark = false }: { value: CompareValue; mark?: string; dark?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className={cn("inline-grid size-6 place-items-center rounded-full", dark ? "bg-white text-deep" : "bg-deep text-white")}>
          <Check aria-hidden className="size-3.5" strokeWidth={2.75} />
          <span className="sr-only">Included</span>
        </span>
        {mark && <span className="text-sm font-semibold">{mark}</span>}
      </span>
    );
  }
  if (value === false) {
    return (
      <span className={cn("inline-grid size-6 place-items-center rounded-full", dark ? "bg-white/15 text-white" : "bg-tint-2 text-muted")}>
        <Minus aria-hidden className="size-3.5" strokeWidth={2.5} />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return (
    <span className="text-sm leading-snug font-semibold">
      {value}
      {mark}
    </span>
  );
}
