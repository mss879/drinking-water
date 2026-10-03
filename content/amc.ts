import { formatLKR } from "@/lib/format";
import type { Faq } from "./faqs";

/**
 * Annual Maintenance Contracts, from LUSAKO's "Water Purifier Annual Maintenance Proposal" and its AMC comparison
 * sheet (October 2026). The prices, visits and discounts are defaults: the admin's AMC plans section can change them
 * (LUSAKO may revise them at renewal), and every amount on the website is worked out from them.
 */
export type AmcPlanId = "essential" | "complete" | "maximum";

export const amcPlanIds: AmcPlanId[] = ["essential", "complete", "maximum"];

/** The plan the proposal recommends; it leads visually everywhere. */
export const recommendedPlan: AmcPlanId = "complete";

/** What the admin can change for each plan. Amounts in LKR; discounts in percent. */
export type AmcPlanTerms = {
  /** Monthly price equivalent; the annual fee is twelve of these. */
  monthly: number;
  /** Preventive maintenance visits a year. */
  visits: number;
  /** Tank chlorination & sanitation services a year. */
  sanitations: number;
  priority: boolean;
  filterDiscount: number;
  partsDiscount: number;
};

export type AmcPlan = AmcPlanTerms & {
  id: AmcPlanId;
  name: string;
  short: string;
  pill: string;
  summary: string;
  /** Essential's labour cover comes with conditions, confirmed before activation. */
  labourNote?: string;
  /** The service form's option for this plan. */
  serviceType: string;
};

/** Standalone prices, so the plans can show what their scheduled services would cost bought separately. */
export type AmcFees = { visit: number; sanitation: number };

export type AmcSettings = { plans: AmcPlan[]; fees: AmcFees };

const plans: AmcPlan[] = [
  {
    id: "essential",
    name: "Essential Maintenance",
    short: "Essential",
    pill: "One visit a year",
    summary: "For customers who want one planned visit and annual tank sanitation, with breakdown support.",
    labourNote: "Essential labour cover is subject to plan conditions; we confirm its scope before activation.",
    serviceType: "amc-essential",
    monthly: 499,
    visits: 1,
    sanitations: 1,
    priority: false,
    filterDiscount: 0,
    partsDiscount: 0,
  },
  {
    id: "complete",
    name: "Complete Annual Care",
    short: "Complete",
    pill: "Recommended",
    summary: "Our recommended balance of regular servicing and cost, with priority service and replacement discounts.",
    serviceType: "amc-complete",
    monthly: 699,
    visits: 3,
    sanitations: 1,
    priority: true,
    filterDiscount: 10,
    partsDiscount: 10,
  },
  {
    id: "maximum",
    name: "Maximum Protection",
    short: "Maximum",
    pill: "Largest discounts",
    summary: "The same scheduled visits as Complete, with larger discounts on replacement filters and spare parts.",
    serviceType: "amc-maximum",
    monthly: 999,
    visits: 3,
    sanitations: 1,
    priority: true,
    filterDiscount: 25,
    partsDiscount: 20,
  },
];

export const defaultAmc: AmcSettings = { plans, fees: { visit: 2000, sanitation: 3500 } };

export const amcPlanName = (id: AmcPlanId) => plans.find((plan) => plan.id === id)!.name;

// ------------------------------------------------------------------ amounts --

export const annualFee = (plan: AmcPlanTerms) => plan.monthly * 12;

/** The annual fee divided by 365, as the proposal works it out. */
export const dailyCost = (plan: AmcPlanTerms) => Math.round((annualFee(plan) / 365) * 100) / 100;

/** What the plan's scheduled services would cost bought one by one. */
export const standaloneValue = (plan: AmcPlanTerms, fees: AmcFees) => plan.visits * fees.visit + plan.sanitations * fees.sanitation;

export const discounted = (price: number, percent: number) => Math.round(price * (100 - percent)) / 100;

export function timesAYear(count: number) {
  if (count === 1) return "once a year";
  if (count === 2) return "twice a year";
  return `${count} times a year`;
}

export const visitsLabel = (count: number) => `${count} ${count === 1 ? "visit" : "visits"}`;

/**
 * The recommended plan against its scheduled services bought separately (the proposal's "value of Complete Annual
 * Care"). Null when the plan no longer comes out cheaper, so the website never shows a negative saving.
 */
export function recommendedValue(amc: AmcSettings) {
  const plan = amc.plans.find((item) => item.id === recommendedPlan)!;
  const separately = standaloneValue(plan, amc.fees);
  const fee = annualFee(plan);
  const saving = separately - fee;
  if (saving <= 0) return null;
  return { plan, separately, fee, saving, percent: Math.round((saving / separately) * 1000) / 10 };
}

/**
 * When Maximum's larger discounts pay for its higher fee, compared with Complete. Null when the numbers don't
 * support the comparison (for example if the admin evens out the discounts).
 */
export function upgradeBreakEven(amc: AmcSettings) {
  const complete = amc.plans.find((plan) => plan.id === "complete")!;
  const maximum = amc.plans.find((plan) => plan.id === "maximum")!;
  const extra = annualFee(maximum) - annualFee(complete);
  const filters = maximum.filterDiscount - complete.filterDiscount;
  const parts = maximum.partsDiscount - complete.partsDiscount;
  if (extra <= 0 || filters < 0 || parts < 0 || filters + parts === 0) return null;
  return { complete, maximum, extra, filters, parts };
}

export function breakEvenSentence(amc: AmcSettings) {
  const upgrade = upgradeBreakEven(amc);
  if (!upgrade) return null;
  const shares = [
    upgrade.filters > 0 && `${upgrade.filters}% of your eligible annual filter spending`,
    upgrade.parts > 0 && `${upgrade.parts}% of your eligible annual spare-parts spending`,
  ].filter(Boolean);
  return `${upgrade.maximum.name} costs ${formatLKR(upgrade.extra)} more a year than ${upgrade.complete.name}. Its extra discounts make up the difference when ${shares.join(" plus ")} comes to more than ${formatLKR(upgrade.extra)}, at standard prices.`;
}

const sanitationPhrase = (amc: AmcSettings) => {
  const counts = new Set(amc.plans.map((plan) => plan.sanitations));
  return counts.size === 1 ? `tank chlorination and sanitation ${timesAYear(amc.plans[0].sanitations)}` : "tank chlorination and sanitation";
};

// --------------------------------------------------------------------- copy --

/** The proposal's three reasons for an AMC. */
export const amcReasons = [
  {
    title: "Care for the system your family or team relies on",
    body: "Regular cleaning, tank sanitation where it applies and filter condition checks support system hygiene and filtration performance. Replacement advice is based on actual condition, water quality and usage, so you can make informed maintenance decisions. Servicing does not itself certify that water is safe to drink.",
  },
  {
    title: "Protect your equipment and your budget",
    body: "Planned inspections help identify leaks, reduced flow and developing faults before they become more disruptive. Included service visits make routine spending easier to plan, and any work beyond your cover is explained before we go ahead. Actual repair savings depend on the condition of your system.",
  },
  {
    title: "Professional attention at every scheduled visit",
    body: "Visits include appropriate cleaning, performance checks, replacement recommendations and a service record update. Procedures vary by model and filtration technology.",
  },
];

/** What our technicians check at every scheduled visit. */
export const visitChecks = [
  "The purifier and filter condition",
  "Water flow and dispensing",
  "Tubing, connections and leaks",
  "Electrical functions, where applicable",
  "Cleaning and performance checks",
  "Replacement recommendations and your service record",
];

/** "A practical annual maintenance routine": how a contract runs, from activation to breakdowns. */
export function amcRoutine(amc: AmcSettings) {
  const priority = amc.plans.filter((plan) => plan.priority).map((plan) => plan.short);
  return [
    {
      title: "Activation",
      body: "We confirm your purifier’s eligibility, the covered installation and the service schedule. A preliminary inspection may be needed, and existing faults may need correcting before cover begins.",
    },
    {
      title: "Preventive visits",
      body: "Your scheduled visits are booked with LUSAKO during the annual term, and each one is recorded in your service history.",
    },
    {
      title: "Annual tank service",
      body: "Cleaning, sanitation, chlorination and a connection inspection of the applicable storage system, followed by operating checks.",
    },
    {
      title: "Breakdown support",
      body: `When a fault occurs, contact LUSAKO for diagnosis and assistance: technician attendance, troubleshooting and covered labour.${
        priority.length ? ` ${priority.join(" and ")} ${priority.length === 1 ? "includes" : "include"} priority service.` : ""
      }`,
    },
  ];
}

/** On-call service, for customers without an AMC. */
export const onCallSteps = [
  { title: "Book a visit", body: "An inspection / call-out fee is paid before the visit." },
  { title: "Inspection & quotation", body: "Our technician inspects the purifier, and we send a repair quotation for your approval." },
  { title: "Approve the repair", body: "Accept within 90 days of the visit and the fee you paid is deducted from the repair invoice." },
];

export const onCallNote = "If you decide not to go ahead with the repair, the fee remains payable for the visit and inspection.";

/** "Key coverage and commercial terms", in the proposal's words. */
export const amcTerms = [
  {
    title: "Contract period and payment",
    body: "Cover starts on the agreed activation date and applies only while the contract is active. We confirm the payment schedule, the covered unit, the service area and the labour scope before you enrol. Taxes are additional unless expressly included.",
  },
  {
    title: "Replacement costs",
    body: "Filters, membranes and spare parts are not included in the AMC fee. Plan discounts apply only to eligible replacements during the active term. Major components and work beyond the stated benefits are quoted separately.",
  },
  {
    title: "Additional work and exclusions",
    body: "Misuse, physical damage, unauthorised modification, abnormal electrical conditions, pests, external causes and improper operation may be excluded. Relocation, installation, additional piping, transport and non-maintenance work are not automatically covered, and visits outside the standard service area may attract charges. Additional charges are always explained before work goes ahead.",
  },
  {
    title: "Visits and benefits",
    body: "Tank sanitation is provided once per annual term. Unused preventive visits can’t normally be exchanged for cash or transferred to other services, and discounts can’t be redeemed for cash or deducted from the AMC fee. The contract is non-transferable unless LUSAKO approves.",
  },
  {
    title: "Renewal",
    body: "LUSAKO may revise prices, benefits and terms for future renewals, with appropriate notice.",
  },
];

// ---------------------------------------------------------- warranty vs AMC --

/** Warranty | Rental | AMC plans | On-call (client: "Comparison table"). true is a tick, false a dash, text a qualifier. */
export type CoverId = "warranty" | "rental" | "amc" | "on-call";
export type CoverCell = boolean | string;

export const coverColumns: { id: CoverId; name: string; detail: string }[] = [
  { id: "warranty", name: "Warranty", detail: "Comes with every purchase" },
  { id: "rental", name: "Rental", detail: "Included in the monthly rental" },
  { id: "amc", name: "AMC plans", detail: "Annual care for purchased systems" },
  { id: "on-call", name: "On-call", detail: "Pay per visit, no contract" },
];

export function coverRows(amc: AmcSettings): { label: string; cells: Record<CoverId, CoverCell> }[] {
  const visits = [...new Set(amc.plans.map((plan) => plan.visits))].sort((a, b) => a - b);
  const visitText = visits.length > 1 ? `${visits[0]}–${visits.at(-1)} visits a year` : `${visitsLabel(visits[0])} a year`;
  const filterOff = Math.max(...amc.plans.map((plan) => plan.filterDiscount));
  const partsOff = Math.max(...amc.plans.map((plan) => plan.partsDiscount));
  return [
    {
      label: "Preventive maintenance",
      cells: { warranty: false, rental: true, amc: visitText, "on-call": `${formatLKR(amc.fees.visit)} a visit` },
    },
    {
      label: "Breakdown support",
      cells: { warranty: "Covered defects", rental: true, amc: true, "on-call": "Call-out fee first" },
    },
    {
      label: "Technician labour",
      cells: { warranty: "Covered defects", rental: true, amc: true, "on-call": "Quoted after inspection" },
    },
    {
      label: "Filters",
      cells: { warranty: "Charged", rental: "Per agreement", amc: filterOff > 0 ? `Up to ${filterOff}% off` : "Charged", "on-call": "Charged" },
    },
    {
      label: "Spare parts",
      cells: { warranty: "Covered defects", rental: true, amc: partsOff > 0 ? `Up to ${partsOff}% off` : "Charged", "on-call": "Charged" },
    },
    {
      label: "Contract",
      cells: { warranty: "Warranty period", rental: "Rental agreement", amc: "Annual", "on-call": "None" },
    },
    {
      label: "Best for",
      cells: { warranty: "New purchases", rental: "One monthly payment", amc: "Planned care for owners", "on-call": "Occasional needs" },
    },
  ];
}

export const coverFootnote =
  "The exact cover is set out in your warranty, rental agreement or AMC contract. AMC fees don’t include filters, membranes or spare parts; plan discounts apply to eligible replacements.";

// --------------------------------------------------------------------- FAQs --

/** The AMC questions, worked out from the current plans so the answers always match the prices shown. */
export function amcFaqs(amc: AmcSettings): Faq[] {
  const byId = (id: AmcPlanId) => amc.plans.find((plan) => plan.id === id)!;
  const withDiscounts = amc.plans.filter((plan) => plan.filterDiscount > 0 || plan.partsDiscount > 0);
  const value = recommendedValue(amc);
  const breakEven = breakEvenSentence(amc);
  const visitGroups = amc.plans.map((plan) => `${visitsLabel(plan.visits)} a year with ${plan.name}`);

  const faqs: Faq[] = [
    {
      topic: "amc",
      q: "How much does an AMC cost?",
      a: `${amc.plans
        .map((plan) => `${plan.name} is ${formatLKR(annualFee(plan))} a year (${formatLKR(plan.monthly)} a month equivalent)`)
        .join(", ")}. Taxes, where applicable, are additional, and payment arrangements are confirmed when you enrol.`,
    },
    {
      topic: "amc",
      q: "What does every AMC plan include?",
      a: `Every plan includes breakdown support, an annual system health check, your service history and ${sanitationPhrase(amc)}. Preventive maintenance depends on the plan: ${visitGroups.join(", ")}.`,
    },
    {
      topic: "amc",
      q: "Which AMC plan should I choose?",
      a: `${byId("essential").name} suits customers who want one planned visit and annual sanitation. ${byId("complete").name} is our recommended balance of regular servicing and cost. ${byId("maximum").name} has the same scheduled visits as ${byId("complete").short}, with larger replacement discounts.${breakEven ? ` ${breakEven}` : ""}`,
    },
    {
      topic: "amc",
      q: "Are filters and spare parts included in the AMC fee?",
      a: `No. Filters, membranes and spare parts are charged separately.${
        withDiscounts.length
          ? ` ${withDiscounts
              .map((plan) => `${plan.name} gives ${plan.filterDiscount}% off eligible filters and ${plan.partsDiscount}% off eligible spare parts`)
              .join("; ")}.`
          : ""
      } Discounts apply to eligible replacements during the active term, and we confirm compatibility and the current price before replacing anything.`,
    },
  ];

  if (value) {
    faqs.push({
      topic: "amc",
      q: `How much do I save with ${value.plan.name}?`,
      a: `Bought separately, its scheduled services cost ${formatLKR(value.separately)}: ${visitsLabel(value.plan.visits).replace("visit", "preventive maintenance visit")} at ${formatLKR(amc.fees.visit)} each and ${value.plan.sanitations === 1 ? "a tank chlorination and sanitation service" : `${value.plan.sanitations} tank chlorination and sanitation services`} at ${formatLKR(amc.fees.sanitation)}. The annual fee is ${formatLKR(value.fee)}, so you save ${formatLKR(value.saving)} (about ${value.percent}%) when you use all the scheduled services, before breakdown support, priority service and the replacement discounts.`,
    });
  }

  faqs.push(
    {
      topic: "amc",
      q: "How does on-call service work without an AMC?",
      a: "An inspection / call-out fee is paid before the visit. After the inspection we send a repair quotation for your approval. If you accept the repair within 90 days of the visit, the fee is deducted from the repair invoice; if you don’t go ahead, the fee remains payable for the visit and inspection.",
    },
    {
      topic: "amc",
      q: "How do I start an AMC?",
      a: "Choose a plan and send us your purifier model, installation address and contact details, here on the website or through your LUSAKO representative. We confirm eligibility, any charges and the activation date before arranging your service schedule. A preliminary inspection may be needed, and existing faults may need correcting before cover begins.",
    },
    {
      topic: "amc",
      q: "Do I need an AMC while my purifier is under warranty?",
      a: "The warranty covers manufacturing defects. It doesn’t schedule your preventive maintenance and tank sanitation or reduce what you pay for filters, which is what an AMC does. Many customers start one when they buy, so maintenance is in place from day one.",
    },
    {
      topic: "amc",
      q: "Are rented purifiers covered by an AMC?",
      a: "Rented systems don’t need one. LUSAKO maintains rented equipment throughout the rental period, according to your rental agreement.",
    },
    {
      topic: "amc",
      q: "Can I transfer my AMC, or exchange unused visits for cash?",
      a: "The contract is non-transferable unless LUSAKO approves. Unused preventive visits can’t normally be exchanged for cash or moved to other services, and discounts can’t be redeemed for cash or deducted from the AMC fee. LUSAKO may revise prices, benefits and terms for future renewals, with appropriate notice.",
    },
  );
  return faqs;
}
