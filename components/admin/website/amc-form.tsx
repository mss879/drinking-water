"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveAmc, type AmcInput, type AmcPlanInput } from "@/app/actions/admin/website";
import { Badge } from "@/components/admin/ui/badge";
import { Field, Input } from "@/components/admin/ui/field";
import { Panel } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import { annualFee, dailyCost, recommendedPlan, standaloneValue, type AmcPlanId, type AmcSettings } from "@/content/amc";
import { formatLKR, formatLKRCents } from "@/lib/format";

const toInput = (amc: AmcSettings): AmcInput => ({
  plans: Object.fromEntries(
    amc.plans.map((plan) => [
      plan.id,
      {
        monthly: String(plan.monthly),
        visits: String(plan.visits),
        sanitations: String(plan.sanitations),
        priority: plan.priority,
        filterDiscount: String(plan.filterDiscount),
        partsDiscount: String(plan.partsDiscount),
      },
    ]),
  ) as Record<AmcPlanId, AmcPlanInput>,
  fees: { visit: String(amc.fees.visit), sanitation: String(amc.fees.sanitation) },
});

const whole = (value: string) => {
  const number = Number(value.replace(/[,\s]/g, ""));
  return Number.isInteger(number) && number >= 0 ? number : null;
};

/** The three AMC plans and the standalone prices they're measured against. Every amount on the website follows. */
export function AmcForm({ initial }: { initial: AmcSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(() => toInput(initial));
  const [pending, startTransition] = useTransition();

  const setPlan = <K extends keyof AmcPlanInput>(id: AmcPlanId, key: K, value: AmcPlanInput[K]) =>
    setForm((current) => ({ ...current, plans: { ...current.plans, [id]: { ...current.plans[id], [key]: value } } }));
  const setFee = (key: keyof AmcInput["fees"], value: string) => setForm((current) => ({ ...current, fees: { ...current.fees, [key]: value } }));

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveAmc(form);
          if (!result.ok) return toast(result.error, "error");
          toast(result.message ?? "Saved.");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 xl:grid-cols-3">
        {initial.plans.map((plan) => {
          const values = form.plans[plan.id];
          const monthly = whole(values.monthly);
          const visits = whole(values.visits);
          const sanitations = whole(values.sanitations);
          const visitFee = whole(form.fees.visit);
          const sanitationFee = whole(form.fees.sanitation);
          const separately =
            visits !== null && sanitations !== null && visitFee !== null && sanitationFee !== null
              ? standaloneValue({ ...plan, visits, sanitations }, { visit: visitFee, sanitation: sanitationFee })
              : null;
          const id = (key: string) => `amc-${plan.id}-${key}`;
          return (
            <Panel
              key={plan.id}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  {plan.name}
                  {plan.id === recommendedPlan && <Badge tone="solid">Recommended</Badge>}
                </span>
              }
              description={plan.summary}
            >
              <div className="grid gap-4">
                <Field
                  label="Monthly price equivalent (LKR)"
                  htmlFor={id("monthly")}
                  hint={
                    monthly
                      ? `Annual fee ${formatLKR(annualFee({ ...plan, monthly }))} · about ${formatLKRCents(dailyCost({ ...plan, monthly }))} a day`
                      : "The annual fee is twelve times this."
                  }
                >
                  <Input id={id("monthly")} inputMode="numeric" required value={values.monthly} onChange={(event) => setPlan(plan.id, "monthly", event.target.value)} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Visits / year" htmlFor={id("visits")}>
                    <Input id={id("visits")} inputMode="numeric" required value={values.visits} onChange={(event) => setPlan(plan.id, "visits", event.target.value)} />
                  </Field>
                  <Field label="Sanitations / year" htmlFor={id("sanitations")}>
                    <Input
                      id={id("sanitations")}
                      inputMode="numeric"
                      required
                      value={values.sanitations}
                      onChange={(event) => setPlan(plan.id, "sanitations", event.target.value)}
                    />
                  </Field>
                  <Field label="Filter discount %" htmlFor={id("filters")}>
                    <Input
                      id={id("filters")}
                      inputMode="numeric"
                      value={values.filterDiscount}
                      onChange={(event) => setPlan(plan.id, "filterDiscount", event.target.value)}
                    />
                  </Field>
                  <Field label="Parts discount %" htmlFor={id("parts")}>
                    <Input
                      id={id("parts")}
                      inputMode="numeric"
                      value={values.partsDiscount}
                      onChange={(event) => setPlan(plan.id, "partsDiscount", event.target.value)}
                    />
                  </Field>
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
                  <input
                    type="checkbox"
                    checked={values.priority}
                    onChange={(event) => setPlan(plan.id, "priority", event.target.checked)}
                    className="size-4 accent-[var(--color-deep)]"
                  />
                  Priority service
                </label>
                {separately !== null && (
                  <p className="rounded-card-sm bg-tint p-3 text-[13px] leading-relaxed text-muted">
                    Its scheduled services cost {formatLKR(separately)} bought separately.
                  </p>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel
        title="Standalone service prices"
        description="What customers without an AMC pay. The website uses them to show how much a plan saves."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
          <Field label="Preventive maintenance visit (LKR)" htmlFor="amc-fee-visit">
            <Input id="amc-fee-visit" inputMode="numeric" required value={form.fees.visit} onChange={(event) => setFee("visit", event.target.value)} />
          </Field>
          <Field label="Tank chlorination & sanitation (LKR)" htmlFor="amc-fee-sanitation">
            <Input
              id="amc-fee-sanitation"
              inputMode="numeric"
              required
              value={form.fees.sanitation}
              onChange={(event) => setFee("sanitation", event.target.value)}
            />
          </Field>
        </div>
      </Panel>

      <div>
        <Button type="submit" loading={pending}>
          Save AMC plans
        </Button>
      </div>
    </form>
  );
}
