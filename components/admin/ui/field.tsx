import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/** Boxed inputs for the admin. 16px text on phones so iOS doesn't zoom into a field. */
export const inputClasses =
  "block w-full min-w-0 rounded-chip border border-line bg-white px-3.5 text-base text-ink transition-colors placeholder:text-muted/70 hover:border-mist focus:border-deep focus:ring-3 focus:ring-brand/15 focus:outline-none disabled:bg-tint disabled:text-muted sm:text-[15px] aria-invalid:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(inputClasses, "h-11", className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClasses, "min-h-28 py-2.5 leading-relaxed", className)} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative min-w-0">
      <select {...props} className={cn(inputClasses, "h-11 cursor-pointer appearance-none pr-10", className)}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-deep" />
    </div>
  );
}

/** A labelled form field. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-ink">
          <span aria-hidden className="mr-1.5 inline-block size-1.5 rounded-full bg-danger align-middle" />
          {error}
        </p>
      ) : (
        hint && <p className="text-[13px] text-muted">{hint}</p>
      )}
    </div>
  );
}
