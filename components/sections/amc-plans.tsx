import { Check, Minus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { WaveLines } from "@/components/ui/decor";
import { Pill } from "@/components/ui/pill";
import { annualFee, dailyCost, recommendedPlan, timesAYear, visitsLabel, type AmcPlan } from "@/content/amc";
import { cn } from "@/lib/cn";
import { formatLKR, formatLKRCents, keepLastWords } from "@/lib/format";

/** The service form, set to this plan, with the request already written. */
export function amcEnquiryHref(plan: Pick<AmcPlan, "serviceType" | "name">) {
  const query = new URLSearchParams({ type: "service", serviceType: plan.serviceType, issue: `I’d like to start ${plan.name} (AMC) for my purifier.` });
  return `/contact?${query}#quote`;
}

/** What a plan includes, and what it leaves out, worked out from its terms. */
export function planFeatures(plan: AmcPlan) {
  const included = [
    ...(plan.visits > 0 ? [`${visitsLabel(plan.visits).replace("visit", "preventive maintenance visit")} a year`] : []),
    ...(plan.sanitations === 1
      ? ["Annual tank chlorination & sanitation"]
      : plan.sanitations > 1
        ? [`Tank chlorination & sanitation ${timesAYear(plan.sanitations)}`]
        : []),
    plan.priority ? "Priority breakdown support" : "Breakdown support",
    plan.labourNote ? "Technician labour*" : "Technician labour included",
    ...(plan.filterDiscount > 0 ? [`${plan.filterDiscount}% off eligible filters`] : []),
    ...(plan.partsDiscount > 0 ? [`${plan.partsDiscount}% off eligible spare parts`] : []),
    "Annual health check & service history",
  ];
  const excluded = [
    ...(plan.visits > 0 ? [] : ["Preventive maintenance visits"]),
    ...(plan.sanitations > 0 ? [] : ["Tank chlorination & sanitation"]),
    ...(plan.priority ? [] : ["Priority service"]),
    ...(plan.filterDiscount === 0 && plan.partsDiscount === 0 ? ["Filter and spare-parts discounts"] : []),
  ];
  return { included, excluded };
}

/**
 * The three AMC plans (LUSAKO's AMC proposal) as StomDent cards: the recommended plan is the solid deep-blue feature,
 * the others are outlined. `compact` keeps the price and summary and leaves the full list to the AMC page.
 */
export function AmcPlans({ plans, className, compact = false }: { plans: AmcPlan[]; className?: string; compact?: boolean }) {
  return (
    <ul className={cn("grid gap-4 lg:grid-cols-3 lg:gap-5", className)}>
      {plans.map((plan) => {
        const featured = plan.id === recommendedPlan;
        const { included, excluded } = planFeatures(plan);
        return (
          <li
            key={plan.id}
            id={compact ? undefined : `amc-${plan.id}`}
            className={cn(
              "relative flex scroll-mt-28 flex-col overflow-hidden p-6 sm:p-8",
              featured ? "rounded-card bg-deep text-white" : "card-line",
            )}
          >
            {featured && <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/3 w-full text-white/15" />}
            <div className="relative">
              <Pill variant={featured ? "white" : "tint"}>{plan.pill}</Pill>
            </div>
            <h3 className="relative mt-6 font-display text-[clamp(1.45rem,1.1rem+0.6vw,1.6rem)] leading-tight font-bold tracking-[-0.02em]">{plan.name}</h3>
            <p className="relative mt-4 flex items-baseline gap-1.5">
              <span className="font-display text-[clamp(2.25rem,1.8rem+1.4vw,2.75rem)] leading-none font-bold tracking-[-0.03em]">
                {formatLKR(plan.monthly)}
              </span>
              <span className={cn("text-sm font-semibold", featured ? "text-white/85" : "text-muted")}>/ month</span>
            </p>
            <p className={cn("relative mt-2 text-sm leading-relaxed", featured ? "text-white/85" : "text-muted")}>
              Annual fee {formatLKR(annualFee(plan))}
              <br />
              About {formatLKRCents(dailyCost(plan))} a day
            </p>
            <p className={cn("relative mt-5 text-[15px] leading-relaxed", featured ? "text-white" : "text-muted")}>{plan.summary}</p>
            {!compact && (
              <ul className={cn("relative mt-6 grid gap-2.5 border-t pt-6", featured ? "border-white/20" : "border-line")}>
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-snug">
                    <span
                      aria-hidden
                      className={cn("mt-px grid size-5 shrink-0 place-items-center rounded-full", featured ? "bg-white text-deep" : "bg-deep text-white")}
                    >
                      <Check className="size-3" strokeWidth={2.5} />
                    </span>
                    {keepLastWords(item)}
                  </li>
                ))}
                {excluded.map((item) => (
                  <li key={item} className={cn("flex items-start gap-3 text-[15px] leading-snug", featured ? "text-white/70" : "text-muted")}>
                    <span
                      aria-hidden
                      className={cn("mt-px grid size-5 shrink-0 place-items-center rounded-full", featured ? "bg-white/15" : "bg-tint-2")}
                    >
                      <Minus className="size-3" strokeWidth={2.5} />
                    </span>
                    <span>
                      <span className="sr-only">Not included: </span>
                      {keepLastWords(item)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {!compact && plan.labourNote && (
              <p className={cn("relative mt-5 text-[13px] leading-relaxed", featured ? "text-white/80" : "text-muted")}>*{plan.labourNote}</p>
            )}
            <div className="relative mt-auto pt-8">
              <ButtonLink href={amcEnquiryHref(plan)} variant={featured ? "white" : "primary"} arrow className="w-full sm:w-auto">
                Choose {plan.short}
              </ButtonLink>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
