import { amcEnquiryHref } from "@/components/sections/amc-plans";
import { CompareCell, type CompareValue } from "@/components/sections/compare-cell";
import { ButtonLink } from "@/components/ui/button";
import { annualFee, dailyCost, recommendedPlan, visitsLabel, type AmcPlan } from "@/content/amc";
import { cn } from "@/lib/cn";
import { formatLKR, formatLKRCents } from "@/lib/format";

type Row = { label: string; cell: (plan: AmcPlan) => { value: CompareValue; mark?: string } };

/** LUSAKO's AMC comparison table, row for row. */
const rows: Row[] = [
  { label: "Monthly price equivalent", cell: (plan) => ({ value: formatLKR(plan.monthly) }) },
  { label: "Annual fee", cell: (plan) => ({ value: formatLKR(annualFee(plan)) }) },
  { label: "Approximate daily cost", cell: (plan) => ({ value: formatLKRCents(dailyCost(plan)) }) },
  { label: "Preventive maintenance", cell: (plan) => ({ value: plan.visits ? `${visitsLabel(plan.visits)} a year` : false }) },
  { label: "Tank chlorination & sanitation", cell: (plan) => ({ value: plan.sanitations ? `${plan.sanitations} a year` : false }) },
  { label: "Breakdown support", cell: () => ({ value: true }) },
  { label: "Technician labour", cell: (plan) => ({ value: true, mark: plan.labourNote ? "*" : undefined }) },
  { label: "Priority service", cell: (plan) => ({ value: plan.priority }) },
  { label: "Filter discount", cell: (plan) => ({ value: plan.filterDiscount ? `${plan.filterDiscount}%` : false }) },
  { label: "Spare-parts discount", cell: (plan) => ({ value: plan.partsDiscount ? `${plan.partsDiscount}%` : false }) },
  { label: "Service history", cell: () => ({ value: true }) },
  { label: "Annual system health check", cell: () => ({ value: true }) },
];

/**
 * Essential | Complete | Maximum, side by side. Tablets and up get the table; phones get one row per line with the
 * three plans under it, and the plan names held under the header while the rows scroll by.
 */
export function AmcComparison({ plans, footnote, className }: { plans: AmcPlan[]; footnote: string; className?: string }) {
  return (
    <div className={className}>
      <div className="card-line hidden overflow-hidden rounded-card-xl md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">What each AMC plan includes and costs</caption>
          <colgroup>
            <col className="w-[34%] lg:w-[31%]" />
            {plans.map((plan) => (
              <col key={plan.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td className="p-5 align-bottom lg:p-6">
                <span className="label">Compare plans</span>
              </td>
              {plans.map((plan) => {
                const featured = plan.id === recommendedPlan;
                return (
                  <th key={plan.id} scope="col" className={cn("p-5 align-top font-normal", featured ? "bg-deep text-white" : "text-ink")}>
                    <span className={cn("block text-[12px] font-semibold tracking-[0.08em] uppercase", featured ? "text-white/80" : "text-muted")}>
                      {featured ? "Recommended" : " "}
                    </span>
                    <span className="mt-1 block font-display text-lg leading-tight font-bold">{plan.name}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th scope="row" className="px-5 py-3.5 text-[15px] font-medium text-muted lg:px-6">
                  {row.label}
                </th>
                {plans.map((plan) => {
                  const featured = plan.id === recommendedPlan;
                  const { value, mark } = row.cell(plan);
                  return (
                    <td key={plan.id} className={cn("px-5 py-3.5 align-middle", featured ? "border-t border-white/15 bg-deep text-white" : "text-ink")}>
                      <CompareCell value={value} mark={mark} dark={featured} />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="p-5 lg:p-6" />
              {plans.map((plan) => {
                const featured = plan.id === recommendedPlan;
                return (
                  <td key={plan.id} className={cn("p-5", featured && "border-t border-white/15 bg-deep")}>
                    <ButtonLink href={amcEnquiryHref(plan)} variant={featured ? "white" : "outline"} size="sm" arrow>
                      Choose {plan.short}
                    </ButtonLink>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        <div
          aria-hidden
          className="sticky top-(--header-h) z-10 -mx-1 grid grid-cols-3 gap-1.5 bg-canvas/95 px-1 pt-1 pb-2 backdrop-blur-sm"
        >
          {plans.map((plan) => (
            <span
              key={plan.id}
              className={cn(
                "rounded-chip py-2 text-center font-display text-[13px] font-bold",
                plan.id === recommendedPlan ? "bg-deep text-white" : "bg-white text-ink ring-1 ring-line ring-inset",
              )}
            >
              {plan.short}
            </span>
          ))}
        </div>
        <dl className="grid">
          {rows.map((row) => (
            <div key={row.label} className="border-t border-line py-3">
              <dt className="text-sm font-medium text-muted">{row.label}</dt>
              <dd className="mt-2 grid grid-cols-3 gap-1.5">
                {plans.map((plan) => {
                  const featured = plan.id === recommendedPlan;
                  const { value, mark } = row.cell(plan);
                  return (
                    <span
                      key={plan.id}
                      className={cn(
                        "grid min-h-11 place-items-center rounded-chip px-1.5 py-2 text-center",
                        featured ? "bg-deep text-white" : "bg-tint text-ink",
                      )}
                    >
                      <span className="sr-only">{plan.name}: </span>
                      <CompareCell value={value} mark={mark} dark={featured} />
                    </span>
                  );
                })}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted">{footnote}</p>
    </div>
  );
}
