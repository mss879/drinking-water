"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  House,
  Info,
  Map as MapIcon,
  MapPin,
  Minus,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Rings } from "@/components/ui/decor";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  buildRentalQuote,
  isWestern,
  provinces,
  rentalCharges,
  rentalPlans,
  type CustomerType,
  type Filtration,
  type ProvinceId,
  type QuoteLine,
} from "@/content/pricing";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

const MIN_UNITS = 1;
const MAX_UNITS = 50;

type Inputs = { province: ProvinceId | ""; customer: CustomerType; filtration: Filtration; units: number };

const customerOptions: { id: CustomerType; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "office", label: "Office", icon: BriefcaseBusiness },
  { id: "company", label: "Company", icon: Building2 },
];

/** PureFlow UF and RO. AquaSpark is priced on request, so it isn't part of the calculator. */
const purificationOptions = rentalPlans.flatMap((plan) =>
  plan.filtration === "UF" || plan.filtration === "RO" ? [{ filtration: plan.filtration, plan }] : [],
);

const field =
  "block w-full rounded-chip border border-line bg-white text-ink transition-[border-color,box-shadow] duration-200 hover:border-ink/25 focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15 focus-visible:outline-none";

const segment =
  "relative cursor-pointer select-none font-medium transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand";

const stepper =
  "grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors duration-200 hover:border-ink/30 aria-disabled:cursor-not-allowed aria-disabled:opacity-40";

const inlineLink = "font-medium text-ink underline decoration-sky underline-offset-4 transition-colors hover:decoration-brand";

const isProvinceId = (value: string): value is ProvinceId => provinces.some((p) => p.id === value);
const provinceLabel = (id: ProvinceId) => provinces.find((p) => p.id === id)?.label ?? id;
const clampUnits = (value: number) => Math.min(MAX_UNITS, Math.max(MIN_UNITS, Math.round(value)));

/** The per-unit rate is read from rentalCharges so the text always matches the amount. */
function lineDetail(line: QuoteLine) {
  if (line.id === "initial") {
    return `${formatLKR(rentalCharges.initialPaymentPerUnit)} per unit, payable only in the first month`;
  }
  return line.detail;
}

function Step({ children, done = false }: { children: ReactNode; done?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors duration-200",
        done ? "bg-ink text-white" : "bg-pastel text-ink",
      )}
    >
      {done ? <Check className="size-3.5" strokeWidth={2.5} /> : children}
    </span>
  );
}

/**
 * Rental calculator (brief Doc 2 §15): asks for the province first, then shows every charge
 * as its own line. The Regional Hydration Service appears only outside the Western Province.
 */
export function RentalCalculator({ className }: { className?: string }) {
  const uid = useId();
  const [inputs, setInputs] = useState<Inputs>({ province: "", customer: "office", filtration: "UF", units: MIN_UNITS });
  // What the visitor is typing in the units field, until it is committed on blur or Enter.
  const [unitsDraft, setUnitsDraft] = useState<string | null>(null);
  const lastTracked = useRef<string | null>(null);

  const typed = unitsDraft === null ? Number.NaN : Number.parseInt(unitsDraft, 10);
  const units = Number.isFinite(typed) ? clampUnits(typed) : inputs.units;
  const { province, customer, filtration } = inputs;
  const plan = purificationOptions.find((option) => option.filtration === filtration)?.plan ?? rentalPlans[0];
  const quote = province ? buildRentalQuote({ filtration, province, customer, units }) : null;

  function report(next: Inputs) {
    const nextProvince = next.province;
    if (!nextProvince) return;
    const key = [nextProvince, next.customer, next.filtration, next.units].join("|");
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    const result = buildRentalQuote({ ...next, province: nextProvince });
    track("rental_quote_calculated", {
      province: nextProvince,
      region: isWestern(nextProvince) ? "western" : "non-western",
      customer_type: next.customer,
      filtration: next.filtration,
      units: next.units,
      monthly_total: result.monthly ?? undefined,
      first_month_total: result.firstMonth ?? undefined,
    });
  }

  function update(patch: Partial<Inputs>) {
    const next = { ...inputs, units, ...patch };
    setInputs(next);
    setUnitsDraft(null);
    report(next);
  }

  function stepUnits(delta: 1 | -1) {
    const next = clampUnits(units + delta);
    if (next === units && unitsDraft === null) return;
    update({ units: next });
  }

  function commitUnits() {
    if (unitsDraft !== null) update({ units });
  }

  const unitsLabel = `${units} ${units === 1 ? "unit" : "units"}`;
  const summary =
    quote && province
      ? quote.firstMonth !== null && quote.monthly !== null
        ? `${plan.name}, ${unitsLabel}, ${provinceLabel(province)}: ${formatLKR(quote.firstMonth)} due in the first month, then ${formatLKR(quote.monthly)} a month plus VAT.`
        : `${plan.name}, ${unitsLabel}, ${provinceLabel(province)}: the Regional Hydration Service and your totals are confirmed in your quote.`
      : "";

  const quoteHref = province
    ? `/contact?${new URLSearchParams({ type: "rental", province, preferredSolution: plan.id }).toString()}`
    : "/contact?type=rental";

  const customerHint =
    customer === "home" ? (
      <>
        Home rentals include a refundable security deposit. For homes, buying is usually the better long-term value.{" "}
        <Link href="/water-purifiers" className={inlineLink}>
          Explore purifiers
        </Link>
      </>
    ) : customer === "company" ? (
      <>
        No security deposit. Several sites or many units?{" "}
        <Link href="/hydration-solutions/corporate" className={inlineLink}>
          Get a corporate proposal
        </Link>
      </>
    ) : (
      "No security deposit for office rentals."
    );

  return (
    <div className={cn("grid gap-2.5 rounded-card-xl bg-frost p-2.5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]", className)}>
      <div className="flex flex-col gap-9 rounded-card bg-white p-5 sm:p-8 lg:p-10">
        <div>
          <label htmlFor={`${uid}-province`} className="flex items-center gap-3 text-[15px] font-medium text-ink">
            <Step done={Boolean(province)}>1</Step>
            Where will it be installed?
          </label>
          <div className="relative mt-3">
            <MapPin aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-brand" />
            <select
              id={`${uid}-province`}
              value={province}
              onChange={(event) => update({ province: isProvinceId(event.target.value) ? event.target.value : "" })}
              aria-describedby={`${uid}-province-hint`}
              className={cn(field, "h-14 cursor-pointer appearance-none pr-11 pl-11 text-base")}
            >
              <option value="">Select your province</option>
              {provinces.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-subtle" />
          </div>
          <p id={`${uid}-province-hint`} className="mt-2 text-sm text-muted">
            We ask first, because rentals outside the Western Province include the Regional Hydration Service.
          </p>
        </div>

        <fieldset className="min-w-0" aria-describedby={`${uid}-customer-hint`}>
          <legend className="text-[15px] font-medium text-ink">
            <span className="flex items-center gap-3">
              <Step>2</Step>
              Who is it for?
            </span>
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-frost p-1">
            {customerOptions.map(({ id, label, icon: Icon }) => (
              <label
                key={id}
                className={cn(
                  segment,
                  "flex h-11 items-center justify-center gap-2 rounded-full text-[15px]",
                  customer === id ? "bg-ink text-white" : "text-ink hover:bg-white",
                )}
              >
                <input
                  type="radio"
                  name={`${uid}-customer`}
                  value={id}
                  checked={customer === id}
                  onChange={() => update({ customer: id })}
                  className="sr-only"
                />
                <Icon aria-hidden className="hidden size-4 shrink-0 sm:block" />
                {label}
              </label>
            ))}
          </div>
          <p id={`${uid}-customer-hint`} className="mt-2 text-sm text-muted">
            {customerHint}
          </p>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="text-[15px] font-medium text-ink">
            <span className="flex items-center gap-3">
              <Step>3</Step>
              Purification
            </span>
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {purificationOptions.map((option) => {
              const selected = filtration === option.filtration;
              return (
                <label
                  key={option.filtration}
                  className={cn(
                    segment,
                    "flex items-center justify-between gap-4 rounded-card-sm border p-4 sm:flex-col sm:items-start sm:justify-start sm:gap-2",
                    selected ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/30",
                  )}
                >
                  <input
                    type="radio"
                    name={`${uid}-filtration`}
                    value={option.filtration}
                    checked={selected}
                    onChange={() => update({ filtration: option.filtration })}
                    className="sr-only"
                  />
                  <span className="min-w-0">
                    <span className="block text-[15px]">{option.plan.name}</span>
                    <span className={cn("block text-[13px] leading-snug font-normal", selected ? "text-white/75" : "text-muted")}>
                      {option.plan.stages} · {option.plan.bestFor}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm">
                    {option.plan.fromMonthly ? `From ${formatLKR(option.plan.fromMonthly)}/month` : "Price on request"}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted">
            Not sure which?{" "}
            <Link href="/find-my-solution" className={inlineLink}>
              Check my water
            </Link>
          </p>
        </fieldset>

        <div>
          <label htmlFor={`${uid}-units`} className="flex items-center gap-3 text-[15px] font-medium text-ink">
            <Step>4</Step>
            Number of units
          </label>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepUnits(-1)}
              aria-label="Remove one unit"
              aria-controls={`${uid}-units`}
              aria-disabled={units <= MIN_UNITS || undefined}
              className={stepper}
            >
              <Minus aria-hidden className="size-5" />
            </button>
            <input
              id={`${uid}-units`}
              type="number"
              inputMode="numeric"
              min={MIN_UNITS}
              max={MAX_UNITS}
              step={1}
              value={unitsDraft ?? String(inputs.units)}
              onChange={(event) => setUnitsDraft(event.target.value)}
              onBlur={commitUnits}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitUnits();
              }}
              aria-describedby={`${uid}-units-hint`}
              className={cn(
                field,
                "h-12 w-24 text-center text-lg font-medium tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              )}
            />
            <button
              type="button"
              onClick={() => stepUnits(1)}
              aria-label="Add one unit"
              aria-controls={`${uid}-units`}
              aria-disabled={units >= MAX_UNITS || undefined}
              className={stepper}
            >
              <Plus aria-hidden className="size-5" />
            </button>
          </div>
          <p id={`${uid}-units-hint`} className="mt-2 text-sm text-muted">
            From {MIN_UNITS} to {MAX_UNITS} units.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-card bg-ocean p-5 text-white sm:p-8 lg:p-10">
        <Rings count={6} className="absolute -top-28 -right-28 size-80 text-white/10" />
        <div className="relative flex h-full flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-h3 font-medium">Your rental estimate</h3>
            {province && <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-medium">{provinceLabel(province)}</span>}
          </div>
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {summary}
          </p>

          {quote ? (
            <>
              <dl className="mt-6 divide-y divide-white/15 border-y border-white/15">
                {quote.lines.map((line) => (
                  <div key={line.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-4">
                    <dt className="text-[15px] font-medium">{line.label}</dt>
                    <dd className="text-right">
                      {line.amount === null ? (
                        <span className="block max-w-[8.5rem] text-sm leading-snug font-medium">Confirmed in your quote</span>
                      ) : (
                        <span className="text-[15px] font-medium whitespace-nowrap tabular-nums">
                          {formatLKR(line.amount)}
                          {line.kind === "monthly" && <span className="text-sm font-normal text-white/70">/month</span>}
                        </span>
                      )}
                    </dd>
                    <dd className="col-span-2 text-sm leading-relaxed text-white/70">{lineDetail(line)}</dd>
                  </div>
                ))}
              </dl>

              <dl className="mt-6 grid gap-2 sm:grid-cols-2">
                <div className="rounded-card-sm bg-white/10 p-4">
                  <dt className="text-sm text-white/75">Due in the first month</dt>
                  <dd className="mt-1">
                    {quote.firstMonth !== null ? (
                      <span className="text-[1.625rem] leading-tight font-medium tracking-[-0.02em] tabular-nums">
                        {formatLKR(quote.firstMonth)}
                      </span>
                    ) : (
                      <span className="text-lg font-medium">Confirmed in your quote</span>
                    )}
                  </dd>
                </div>
                <div className="rounded-card-sm bg-white p-4 text-ink">
                  <dt className="text-sm text-muted">From month two</dt>
                  <dd className="mt-1">
                    {quote.monthly !== null ? (
                      <>
                        <span className="text-[1.625rem] leading-tight font-medium tracking-[-0.02em] tabular-nums">
                          {formatLKR(quote.monthly)}
                        </span>
                        <span className="text-sm text-muted">/month + VAT</span>
                      </>
                    ) : (
                      <span className="text-lg font-medium">Confirmed in your quote</span>
                    )}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 flex gap-3 text-sm leading-relaxed text-white/80">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-aqua" />
                <span>
                  Western Province: rental only. Outside the Western Province, the Regional Hydration Service is shown as a separate line,
                  never hidden in the rental.
                </span>
              </p>

              <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <ButtonLink href={quoteHref} variant="white" size="lg" arrow className="w-full sm:w-auto">
                  Get this quote
                </ButtonLink>
                <p className="text-xs leading-relaxed text-white/60 sm:max-w-[16rem]">
                  Estimates use each plan’s starting monthly rental and exclude VAT. Your quote confirms the machine, term and final
                  amounts.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-start justify-center gap-4 py-10 sm:py-14">
              <IconBadge variant="white" size="lg" framed>
                <MapIcon />
              </IconBadge>
              <p className="text-xl font-medium">Start with your province</p>
              <p className="max-w-sm text-[15px] leading-relaxed text-white/75">
                Choose where your purifier will be installed and we’ll show every charge, line by line: the monthly rental, the one-time
                initial payment and anything else that applies to you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
