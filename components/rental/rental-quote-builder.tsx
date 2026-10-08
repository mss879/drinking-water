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
import { WaveLines } from "@/components/ui/decor";
import { IconBadge } from "@/components/ui/icon-badge";
import type { rentalQuoteBuilder } from "@/content/copy/rental";
import { fill } from "@/content/copy/schema";
import {
  isWestern,
  provinces,
  buildRentalQuote,
  type CustomerType,
  type Filtration,
  type ProvinceId,
  type QuoteLine,
  type RentalPlan,
  type RentalPrices,
} from "@/content/pricing";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

const MIN_UNITS = 1;
const MAX_UNITS = 50;

type Inputs = { province: ProvinceId | ""; customer: CustomerType; filtration: Filtration; units: number };

/** The customer types, in the order of the copy's answers (their labels are editable, their ids and icons aren't). */
const customerOptions: { id: CustomerType; icon: LucideIcon }[] = [
  { id: "home", icon: House },
  { id: "office", icon: BriefcaseBusiness },
  { id: "company", icon: Building2 },
];

/** PureFlow UF and RO. AquaSpark is quoted on its own, so it isn't part of the builder. */
const purificationOptionsFrom = (plans: RentalPlan[]) =>
  plans.flatMap((plan) => (plan.filtration === "UF" || plan.filtration === "RO" ? [{ filtration: plan.filtration, plan }] : []));

const field =
  "block w-full rounded-chip border border-line bg-white text-ink transition-[border-color,box-shadow] duration-200 hover:border-brand focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15 focus-visible:outline-none";

const segment =
  "relative cursor-pointer select-none font-medium transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand";

const stepper =
  "grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors duration-200 hover:border-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-40";

const inlineLink = "font-medium text-ink underline decoration-brand underline-offset-4 transition-colors hover:decoration-deep";

const isProvinceId = (value: string): value is ProvinceId => provinces.some((p) => p.id === value);
const provinceLabel = (id: ProvinceId) => provinces.find((p) => p.id === id)?.label ?? id;
const clampUnits = (value: number) => Math.min(MAX_UNITS, Math.max(MIN_UNITS, Math.round(value)));

/** Fills {tokens} as text of their own, the way the JSX they replace rendered numbers between words. */
function withValues(text: string, values: Record<string, string | number>): ReactNode[] {
  return text
    .split(/(\{[a-zA-Z]+\})/)
    .filter(Boolean)
    .map((part) => {
      const value = /^\{[a-zA-Z]+\}$/.test(part) ? values[part.slice(1, -1)] : undefined;
      return value ?? part;
    });
}

function Step({ children, done = false }: { children: ReactNode; done?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors duration-200",
        done ? "bg-deep text-white" : "bg-tint-2 text-ink",
      )}
    >
      {done ? <Check className="size-3.5" strokeWidth={2.5} /> : children}
    </span>
  );
}

/**
 * Rental quote builder (brief Doc 2 §15): asks for the province first, then shows every line the quote will carry.
 * The Regional Hydration Service appears only outside the Western Province. "Get my rental quote" opens the rental
 * form with the choices filled in. Its wording comes from the page (content/copy/rental.ts), and so do the plans and
 * the amounts the admin has switched on: while a quote has none, it lists the lines only (the October 2026 design);
 * once it has some, each line, the first month and the monthly total show their amounts as the calculator did.
 */
export function RentalQuoteBuilder({
  className,
  copy,
  plans,
  prices,
}: {
  className?: string;
  copy: typeof rentalQuoteBuilder.defaults;
  plans: RentalPlan[];
  prices: RentalPrices;
}) {
  const uid = useId();
  const purificationOptions = purificationOptionsFrom(plans);
  const [inputs, setInputs] = useState<Inputs>({ province: "", customer: "office", filtration: "UF", units: MIN_UNITS });
  // What the visitor is typing in the units field, until it is committed on blur or Enter.
  const [unitsDraft, setUnitsDraft] = useState<string | null>(null);
  const lastTracked = useRef<string | null>(null);

  const typed = unitsDraft === null ? Number.NaN : Number.parseInt(unitsDraft, 10);
  const units = Number.isFinite(typed) ? clampUnits(typed) : inputs.units;
  const { province, customer, filtration } = inputs;
  const plan = purificationOptions.find((option) => option.filtration === filtration)?.plan ?? plans[0];
  const quote = province ? buildRentalQuote({ filtration, province, units }, prices) : null;
  const lines = quote?.lines ?? null;
  const regional = province !== "" && !isWestern(province);
  // Any amount on this quote switches the panel to amounts (with "Confirmed in your quote" for the rest).
  const priced = lines?.some((line) => line.amount !== null) ?? false;
  // Before a province is chosen: whether the quote will show any amounts at all.
  const canPrice =
    purificationOptions.some((option) => prices.plans[option.plan.id] !== undefined) ||
    prices.initial !== null ||
    prices.regional !== null ||
    Object.keys(prices.regionalByProvince).length > 0;
  const estimating = quote ? priced : canPrice;

  function report(next: Inputs) {
    const nextProvince = next.province;
    if (!nextProvince) return;
    const key = [nextProvince, next.customer, next.filtration, next.units].join("|");
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    const result = buildRentalQuote({ filtration: next.filtration, province: nextProvince, units: next.units }, prices);
    track("rental_quote_calculated", {
      province: nextProvince,
      region: isWestern(nextProvince) ? "western" : "non-western",
      customer_type: next.customer,
      filtration: next.filtration,
      units: next.units,
      ...(result.monthly !== null && { monthly_total: result.monthly }),
      ...(result.firstMonth !== null && { first_month_total: result.firstMonth }),
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

  const unitsLabel = fill(units === 1 ? copy.oneUnit : copy.manyUnits, { count: units });

  /** A quote line's label and detail from the copy. The initial payment's detail names its amount while it is shown. */
  function lineText(line: QuoteLine) {
    if (line.id === "rental") return { label: copy.rentalLine, detail: fill(copy.rentalDetail, { plan: plan.name, units: unitsLabel }) };
    if (line.id === "regional") return { label: copy.regionalLine, detail: copy.regionalDetail };
    return {
      label: copy.initialLine,
      detail: prices.initial !== null ? fill(copy.initialDetailWithPrice, { price: formatLKR(prices.initial) }) : copy.initialDetail,
    };
  }

  /** The live summary for screen readers. Its wording stays in the code; it reuses the lines' labels. */
  function describe() {
    if (!quote || !province) return "";
    const where = `${plan.name}, ${unitsLabel}, ${provinceLabel(province)}`;
    if (!priced) return `${where}: your quote lists ${quote.lines.map((line) => lineText(line).label.toLowerCase()).join(", ")}.`;
    if (quote.firstMonth !== null && quote.monthly !== null) {
      return `${where}: ${formatLKR(quote.firstMonth)} due in the first month, then ${formatLKR(quote.monthly)} a month plus VAT.`;
    }
    const unconfirmed = quote.lines.filter((line) => line.amount === null).map((line) => lineText(line).label);
    // The initial payment alone is hidden: the monthly total is still known.
    if (quote.monthly !== null) {
      return `${where}: ${formatLKR(quote.monthly)} a month plus VAT. The ${unconfirmed.join(", ")} and your first-month total are confirmed in your quote.`;
    }
    return `${where}: the ${unconfirmed.join(", ")} and your totals are confirmed in your quote.`;
  }
  const summary = describe();

  const quoteHref = province
    ? `/contact?${new URLSearchParams({ type: "rental", province, preferredSolution: plan.id }).toString()}#quote`
    : "/contact?type=rental#quote";

  const customerHint =
    customer === "home" ? (
      <>
        {copy.homeHint}{" "}
        <Link href="/water-purifiers" className={inlineLink}>
          {copy.homeLink}
        </Link>
      </>
    ) : customer === "company" ? (
      <>
        {copy.companyHint}{" "}
        <Link href="/hydration-solutions/corporate" className={inlineLink}>
          {copy.companyLink}
        </Link>
      </>
    ) : (
      copy.officeHint
    );

  return (
    <div className={cn("grid gap-2.5 rounded-card-xl bg-tint p-2.5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]", className)}>
      <div className="flex flex-col gap-9 rounded-card bg-white p-5 sm:p-8 lg:p-10">
        <div>
          <label htmlFor={`${uid}-province`} className="flex items-center gap-3 text-[15px] font-medium text-ink">
            <Step done={Boolean(province)}>1</Step>
            {copy.provinceLabel}
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
              <option value="">{copy.provincePlaceholder}</option>
              {provinces.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted" />
          </div>
          <p id={`${uid}-province-hint`} className="mt-2 text-sm text-muted">
            {copy.provinceHint}
          </p>
        </div>

        <fieldset className="min-w-0" aria-describedby={`${uid}-customer-hint`}>
          <legend className="text-[15px] font-medium text-ink">
            <span className="flex items-center gap-3">
              <Step>2</Step>
              {copy.customerLabel}
            </span>
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-tint p-1">
            {customerOptions.map(({ id, icon: Icon }, i) => (
              <label
                key={id}
                className={cn(
                  segment,
                  "flex h-11 items-center justify-center gap-2 rounded-full text-[13px] min-[360px]:text-[15px]",
                  customer === id ? "bg-deep text-white" : "text-ink hover:bg-white",
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
                {copy.customers[i]}
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
              {copy.purificationLabel}
            </span>
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {purificationOptions.map((option) => {
              const selected = filtration === option.filtration;
              const from = prices.plans[option.plan.id];
              return (
                <label
                  key={option.filtration}
                  className={cn(
                    segment,
                    "flex flex-col items-start gap-2 rounded-card-sm border p-4",
                    selected ? "border-deep bg-deep text-white" : "border-line bg-white text-ink hover:border-brand",
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
                    <span className={cn("mt-0.5 block text-[13px] leading-snug font-normal", selected ? "text-white/85" : "text-muted")}>
                      {option.plan.stages} · {option.plan.bestFor}
                    </span>
                  </span>
                  {from !== undefined && (
                    <span className="shrink-0 text-sm">{`${fill(copy.planPrice, { price: formatLKR(from) })}/month`}</span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted">
            {copy.purificationHint}{" "}
            <Link href="/find-my-solution" className={inlineLink}>
              {copy.purificationLink}
            </Link>
          </p>
        </fieldset>

        <div>
          <label htmlFor={`${uid}-units`} className="flex items-center gap-3 text-[15px] font-medium text-ink">
            <Step>4</Step>
            {copy.unitsLabel}
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
            {withValues(copy.unitsHint, { min: MIN_UNITS, max: MAX_UNITS })}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-card bg-deep p-5 text-white sm:p-8 lg:p-10">
        <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />
        <div className="relative flex h-full flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-h3 font-bold">{estimating ? copy.titleWithPrice : copy.title}</h3>
            {province && <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-medium">{provinceLabel(province)}</span>}
          </div>
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {summary}
          </p>

          {lines ? (
            <>
              <dl className="mt-6 divide-y divide-white/15 border-y border-white/15">
                {lines.map((line) => {
                  const { label, detail } = lineText(line);
                  return (
                    <div key={line.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-4">
                      <dt className="text-[15px] font-medium">{label}</dt>
                      <dd className="text-right">
                        {!priced ? (
                          <span className="text-sm font-medium whitespace-nowrap text-white/85">
                            {line.kind === "monthly" ? copy.everyMonth : copy.firstMonthOnly}
                          </span>
                        ) : line.amount === null ? (
                          <span className="block max-w-[8.5rem] text-sm leading-snug font-medium">{copy.confirmed}</span>
                        ) : (
                          <span className="text-[15px] font-medium whitespace-nowrap tabular-nums">
                            {formatLKR(line.amount)}
                            {line.kind === "monthly" && <span className="text-sm font-normal text-white/85">/month</span>}
                          </span>
                        )}
                      </dd>
                      <dd className="col-span-2 text-sm leading-relaxed text-white/85">{detail}</dd>
                    </div>
                  );
                })}
              </dl>

              {priced && quote ? (
                <dl className="mt-6 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-card-sm bg-white/10 p-4">
                    <dt className="text-sm text-white/85">{copy.firstMonthLabelWithPrice}</dt>
                    <dd className="mt-1">
                      {quote.firstMonth !== null ? (
                        <span className="text-[1.625rem] leading-tight font-medium tracking-[-0.02em] tabular-nums">
                          {formatLKR(quote.firstMonth)}
                        </span>
                      ) : (
                        <span className="text-lg font-medium">{copy.confirmed}</span>
                      )}
                    </dd>
                  </div>
                  <div className="rounded-card-sm bg-white p-4 text-ink">
                    <dt className="text-sm text-muted">{copy.laterLabel}</dt>
                    <dd className="mt-1">
                      {quote.monthly !== null ? (
                        <>
                          <span className="text-[1.625rem] leading-tight font-medium tracking-[-0.02em] tabular-nums">
                            {formatLKR(quote.monthly)}
                          </span>
                          <span className="text-sm text-muted">/month + VAT</span>
                        </>
                      ) : (
                        <span className="text-lg font-medium">{copy.confirmed}</span>
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <dl className="mt-6 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-card-sm bg-white/10 p-4">
                    <dt className="text-sm text-white/85">{copy.firstMonthLabel}</dt>
                    <dd className="mt-1 text-lg leading-snug font-medium">{regional ? copy.firstMonthRegional : copy.firstMonth}</dd>
                  </div>
                  <div className="rounded-card-sm bg-white p-4 text-ink">
                    <dt className="text-sm text-muted">{copy.laterLabel}</dt>
                    <dd className="mt-1 text-lg leading-snug font-medium">{regional ? copy.laterRegional : copy.later}</dd>
                  </div>
                </dl>
              )}

              <p className="mt-5 flex gap-3 text-sm leading-relaxed text-white/80">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-mist" />
                <span>{copy.note}</span>
              </p>

              <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <ButtonLink href={quoteHref} variant="white" size="lg" arrow className="w-full sm:w-auto">
                  {priced ? copy.buttonWithPrice : copy.button}
                </ButtonLink>
                {/* VAT statements stay in the code. */}
                <p className="text-xs leading-relaxed text-white/85 sm:max-w-[16rem]">
                  {priced
                    ? "Estimates use each plan’s starting monthly rental and exclude VAT. Your quote confirms the machine, term and final amounts."
                    : "Your quote confirms the machine, the term and every amount, excluding VAT."}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-start justify-center gap-4 py-10 sm:py-14">
              <IconBadge variant="white" size="lg" framed>
                <MapIcon />
              </IconBadge>
              <p className="text-xl font-medium">{copy.emptyTitle}</p>
              <p className="max-w-sm text-[15px] leading-relaxed text-white/85">{canPrice ? copy.emptyTextWithPrice : copy.emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
