import { amcReasons, amcTerms, coverColumns, coverFootnote, coverText, defaultAmc, onCallNote, onCallSteps, routineSteps, visitChecks } from "../amc";
import { defineBlock, type AnyBlock } from "./schema";
import { ctaBlock } from "./shared";

/**
 * AMC plans: its editable text. Every block's defaults are the page's wording as designed. The figures (prices,
 * visits, discounts, savings) are worked out from AMC plans and filled in where the text has a {token}.
 */

/**
 * The page's search title and description. The description is a template: the page fills in the lowest monthly
 * price and the largest filter discount, and uses the second wording while no plan has a filter discount.
 */
export const amcSeo = defineBlock({
  key: "amc.seo",
  label: "Search & sharing",
  description:
    "The title and description Google and social cards show for this page. Keep the title under 60 characters (longer ones drop “ | LUSAKO”) and the description, once its figures are filled in, between 120 and 160.",
  fields: {
    title: { kind: "text", label: "Title", max: 70 },
    description: {
      kind: "text",
      label: "Description",
      max: 180,
      tokens: ["{price}", "{discount}"],
      hint: "{price} is the lowest monthly plan price and {discount} the largest filter discount, both from AMC plans.",
    },
    descriptionNoDiscount: {
      kind: "text",
      label: "Description while no plan has a filter discount",
      max: 170,
      tokens: ["{price}"],
      hint: "{price} is the lowest monthly plan price in AMC plans.",
    },
  },
  defaults: {
    title: "Water Purifier AMC Plans – Annual Maintenance",
    description:
      "LUSAKO water purifier AMC plans from {price} a month: preventive visits, tank sanitation, breakdown support and up to {discount}% off filters. Compare the three plans.",
    descriptionNoDiscount:
      "LUSAKO water purifier AMC plans from {price} a month: preventive visits, tank sanitation, breakdown support. Compare the three plans.",
  },
});

export const amcHero = defineBlock({
  key: "amc.hero",
  label: "Hero",
  description: "The label, headline and intro over the AMC photo, and the two buttons.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 32 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 24,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each on its own line. Wrap the words shown in blue in *asterisks*, like *your water purifier*.",
    },
    description: { kind: "text", label: "Intro", max: 156, multiline: true },
    plansButton: { kind: "text", label: "First button (goes to the plans)", max: 24 },
    compareButton: { kind: "text", label: "Second button (goes to the plan comparison)", max: 24 },
  },
  defaults: {
    eyebrow: "Annual Maintenance Contracts",
    title: ["Professional care for", "*your water purifier*"],
    description:
      "Scheduled servicing, tank sanitation and technical support for the purifier you rely on, with a defined annual maintenance budget.",
    plansButton: "Choose a plan",
    compareButton: "Compare the plans",
  },
});

export const amcStrip = defineBlock({
  key: "amc.strip",
  label: "Strip under the hero",
  description: "The line that sums the page up, the sentence under it and the blue price tag. The pills are the plans’ short names.",
  fields: {
    title: { kind: "text", label: "Heading", max: 28 },
    description: { kind: "text", label: "Text", max: 106 },
    price: {
      kind: "text",
      label: "Blue price tag",
      max: 24,
      tokens: ["{price}"],
      hint: "{price} is the lowest monthly plan price in AMC plans.",
    },
  },
  defaults: {
    title: "Three annual care plans",
    description: "Breakdown support, an annual health check and your service history come with every plan.",
    price: "From {price} / month",
  },
});

export const amcPlansHeading = defineBlock({
  key: "amc.plansHeading",
  label: "Annual care plans: heading",
  description:
    "The heading over the three plan cards and the note under them. The plans’ names and wording are in AMC plan names and descriptions; their prices, visits and discounts in AMC plans.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 52,
      marks: "one",
      hint: "Wrap the words shown in blue in *asterisks*, like *usage and budget*.",
    },
    description: {
      kind: "text",
      label: "Text",
      max: 200,
      multiline: true,
      tokens: ["{plan}"],
      hint: "{plan} is the recommended plan’s name.",
    },
    taxNote: { kind: "text", label: "Note under the plans", max: 48 },
  },
  defaults: {
    eyebrow: "Annual care plans",
    title: "A plan for your purifier, *usage and budget*",
    description:
      "Filters, membranes and spare parts are charged separately, with the discounts each plan includes. We recommend {plan} for regular preventive maintenance and clear value.",
    taxNote: "Taxes, where applicable, are additional.",
  },
});

export const amcPlansCopy = defineBlock({
  key: "amc.plans",
  label: "AMC plan names and descriptions",
  description:
    "Each plan’s name and wording, everywhere it appears (plan cards, tables, questions, the service form). Prices, visits and discounts are in AMC plans.",
  fields: {
    plans: {
      kind: "cards",
      label: "Plans",
      count: [3, 3],
      reorder: false,
      itemLabel: "Plan",
      itemNames: defaultAmc.plans.map((plan) => plan.name),
      item: {
        name: { kind: "text", label: "Name", max: 28 },
        short: { kind: "text", label: "Short name (buttons and pills)", max: 12 },
        pill: { kind: "text", label: "Tag on the plan card", max: 24 },
        summary: { kind: "text", label: "Summary", max: 140 },
        labourNote: { kind: "text", label: "Labour cover note", max: 140, optional: true },
      },
    },
  },
  defaults: {
    plans: defaultAmc.plans.map(({ name, short, pill, summary, labourNote }) => ({ name, short, pill, summary, labourNote: labourNote ?? "" })),
  },
});

/** The wording around each plan card's figures, here and on Service & support. The feature lists follow the plans. */
export const amcPlanCards = defineBlock({
  key: "amc.planCards",
  label: "Plan cards: prices and buttons",
  description:
    "The words around each plan card’s price (here and on Service & support) and its button, also used under each plan in the comparison table. The figures and each plan’s list of what it includes follow AMC plans.",
  fields: {
    perMonth: { kind: "text", label: "After the monthly price", max: 10 },
    annualFee: { kind: "text", label: "Annual fee line", max: 24, tokens: ["{price}"], hint: "{price} is twelve times the monthly price." },
    daily: { kind: "text", label: "Daily cost line", max: 24, tokens: ["{price}"], hint: "{price} is the annual fee divided by 365." },
    button: {
      kind: "text",
      label: "Button (opens the service form, set to the plan)",
      max: 20,
      tokens: ["{plan}"],
      hint: "{plan} is the plan’s short name.",
    },
  },
  defaults: {
    perMonth: "/ month",
    annualFee: "Annual fee {price}",
    daily: "About {price} a day",
    button: "Choose {plan}",
  },
});

export const amcCompare = defineBlock({
  key: "amc.compare",
  label: "Plan comparison",
  description:
    "The heading over the side-by-side table and the note under it. The table’s rows and figures follow AMC plans; the Essential labour note (AMC plan names and descriptions) starts the note.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 38,
      marks: "one",
      hint: "Wrap the words shown in blue in *asterisks*, like *side by side*.",
    },
    description: { kind: "text", label: "Text", max: 113 },
    footnote: { kind: "text", label: "Note under the table", max: 272, multiline: true },
  },
  defaults: {
    eyebrow: "Compare",
    title: "The three plans, *side by side*",
    description: "Every plan includes breakdown support, an annual system health check and your service history.",
    footnote:
      "Labour and breakdown support across all plans remain subject to the agreed AMC scope. Daily costs are the annual fee divided by 365, and payment arrangements are confirmed at enrolment. Taxes, where applicable, are additional.",
  },
});

/** "Planned care that pays its way": the recommended plan against its scheduled services bought one by one. */
export const amcValue = defineBlock({
  key: "amc.value",
  label: "Plan value",
  description:
    "The recommended plan’s value: the text and the dark card that add up its scheduled services. Every figure is worked out from AMC plans, and the section hides itself while the plan doesn’t save money.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 38,
      marks: "one",
      hint: "Wrap the words shown in blue in *asterisks*, like *pays its way*.",
    },
    saving: {
      kind: "text",
      label: "First paragraph",
      max: 248,
      multiline: true,
      tokens: ["{percent}", "{discount}"],
      hint: "{percent} is the saving in percent and {discount} the recommended plan’s filter discount.",
    },
    fees: {
      kind: "text",
      label: "Second paragraph",
      max: 142,
      multiline: true,
      tokens: ["{visit}", "{sanitation}"],
      hint: "{visit} and {sanitation} are the prices without an AMC, from AMC plans.",
    },
    separately: { kind: "text", label: "Card: total line", max: 28 },
    annualFee: { kind: "text", label: "Card: annual fee line", max: 22, tokens: ["{plan}"], hint: "{plan} is the recommended plan’s name." },
    savingLabel: { kind: "text", label: "Card: saving", max: 40 },
    percent: { kind: "text", label: "Card: saving in percent", max: 20, tokens: ["{percent}"], hint: "{percent} is the saving in percent." },
    monthly: {
      kind: "text",
      label: "Card: line at the bottom",
      max: 60,
      tokens: ["{monthly}", "{daily}"],
      hint: "{monthly} is the plan’s monthly price and {daily} its daily cost.",
    },
  },
  defaults: {
    eyebrow: "Plan value",
    title: "Planned care that *pays its way*",
    saving:
      "Save about {percent}% against the standalone price of its scheduled services when you use them all. Breakdown support, priority service and {discount}% off eligible filters and spare parts add further value.",
    fees: "Without an AMC, a preventive maintenance visit is {visit} and a tank chlorination and sanitation service {sanitation}.",
    separately: "Total bought separately",
    annualFee: "{plan} annual fee",
    savingLabel: "Your saving on scheduled services",
    percent: "about {percent}%",
    monthly: "{monthly} a month equivalent · about {daily} a day",
  },
});

/** "What eligible filter replacements could cost": the filter prices against each plan's discount. */
export const amcFilters = defineBlock({
  key: "amc.filters",
  label: "Filter replacement prices",
  description:
    "The heading over the filter price table and the note under it. The filters and their prices are in Parts & accessories, the discounts in AMC plans.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 26 },
    title: {
      kind: "text",
      label: "Heading",
      max: 55,
      marks: "one",
      hint: "Wrap the words shown in blue in *asterisks*, like *could cost*.",
    },
    description: { kind: "text", label: "Text", max: 107 },
    button: { kind: "text", label: "Button (opens Filters, parts & accessories)", max: 24 },
    life: {
      kind: "text",
      label: "A filter’s typical life",
      max: 41,
      tokens: ["{months}"],
      hint: "Shown under each filter’s name. {months} is its typical life from Parts & accessories.",
    },
    note: { kind: "text", label: "Note under the table", max: 280, multiline: true },
  },
  defaults: {
    eyebrow: "Replacement discounts",
    title: "What eligible filter replacements *could cost*",
    description: "Individual replacement examples at standard prices, not a required annual filter package.",
    button: "All filters & parts",
    life: "Typical life about {months} months",
    note: "All figures in LKR, from the listed standard prices and excluding applicable taxes. Compatibility, eligibility and the current price are confirmed before replacement; intervals vary with water quality, usage and operating conditions.",
  },
});

export const amcWhy = defineBlock({
  key: "amc.why",
  label: "Why an AMC",
  description: "The dark band with the three reasons for an AMC and what technicians check at every scheduled visit.",
  fields: {
    pill: { kind: "text", label: "Pill", max: 20 },
    title: { kind: "text", label: "Heading", max: 65 },
    text: { kind: "text", label: "Text beside the heading", max: 205, multiline: true },
    reasons: {
      kind: "cards",
      label: "Reasons",
      count: [3, 3],
      itemLabel: "Reason",
      hint: "Three cards side by side on computers.",
      item: {
        title: { kind: "text", label: "Title", max: 59 },
        body: { kind: "text", label: "Text", max: 377, multiline: true },
      },
    },
    checksTitle: { kind: "text", label: "Checklist heading", max: 57 },
    checks: {
      kind: "list",
      label: "Checklist",
      count: [3, 9],
      max: 62,
      itemLabel: "Item",
      hint: "Set in three columns on computers, so 3, 6 or 9 items fill the rows evenly.",
    },
  },
  defaults: {
    pill: "Why an AMC",
    title: "An investment in everyday drinking water, looked after",
    text: "Your purifier is an investment in everyday drinking water. An AMC cares for it through scheduled servicing, sanitation and technical support, with a defined annual budget.",
    reasons: amcReasons.map(({ title, body }) => ({ title, body })),
    checksTitle: "At every scheduled visit, our technicians check",
    checks: [...visitChecks],
  },
});

export const amcRoutineCopy = defineBlock({
  key: "amc.routine",
  label: "How your AMC works",
  description:
    "The four steps of an annual contract, from activation to breakdowns. The breakdown step ends with the plans that include priority service, worked out from AMC plans.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 24,
      marks: "one",
      hint: "Wrap the word shown in blue in *asterisks*, like *works*.",
    },
    steps: {
      kind: "cards",
      label: "Steps",
      count: [4, 4],
      reorder: false,
      itemLabel: "Step",
      itemNames: routineSteps.map((step) => step.title),
      hint: "Numbered 1 to 4. The fourth step’s text is followed by the plans that include priority service.",
      item: {
        title: { kind: "text", label: "Title", max: 24 },
        body: { kind: "text", label: "Text", max: 230, multiline: true },
      },
    },
  },
  defaults: {
    eyebrow: "Service delivery",
    title: "How your AMC *works*",
    steps: routineSteps.map(({ title, body }) => ({ title, body })),
  },
});

export const amcTermsCopy = defineBlock({
  key: "amc.terms",
  label: "Key terms",
  description:
    "The coverage and commercial terms beside “How your AMC works”, each opening when clicked. “Visits and benefits” starts with how often tank sanitation is provided, worked out from AMC plans.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 35 },
    terms: {
      kind: "cards",
      label: "Terms",
      count: [5, 5],
      reorder: false,
      itemLabel: "Term",
      itemNames: amcTerms.map((term) => term.title),
      item: {
        title: { kind: "text", label: "Title", max: 36 },
        body: { kind: "text", label: "Text", max: 465, multiline: true },
      },
    },
  },
  defaults: {
    eyebrow: "Key terms",
    title: "Coverage and commercial terms",
    terms: amcTerms.map(({ title, body }) => ({ title, body })),
  },
});

/** On-call service, for customers without an AMC. The first step names the visit fee while it's switched on. */
export const amcOnCall = defineBlock({
  key: "amc.onCall",
  label: "On-call service",
  description: "The light band for customers who’d rather pay per visit: its three steps, the note and the button.",
  fields: {
    pill: { kind: "text", label: "Pill", max: 20 },
    title: { kind: "text", label: "Heading", max: 36 },
    text: { kind: "text", label: "Text beside the heading", max: 126, multiline: true },
    steps: {
      kind: "cards",
      label: "Steps",
      count: [3, 3],
      reorder: false,
      itemLabel: "Step",
      itemNames: onCallSteps.map((step) => step.title),
      hint: "Numbered 01 to 03.",
      item: {
        title: { kind: "text", label: "Title", max: 28 },
        body: { kind: "text", label: "Text", max: 112, multiline: true },
      },
    },
    bookWithPrice: {
      kind: "text",
      label: "First step: text while the fee is shown",
      max: 80,
      multiline: true,
      tokens: ["{price}"],
      hint: "Replaces the first step’s text while the on-call visit fee is switched on in Prices & quotes. {price} is that fee.",
    },
    note: { kind: "text", label: "Note beside the button", max: 120, multiline: true },
    button: { kind: "text", label: "Button (opens the service form, set to on-call)", max: 26 },
  },
  defaults: {
    pill: "No contract",
    title: "Prefer service without an AMC?",
    text: "On-call service remains available. You pay for each visit, and approve any repair before we carry it out.",
    steps: onCallSteps.map(({ title, body }) => ({ title, body })),
    bookWithPrice: "An inspection / call-out fee of {price} is paid before the visit.",
    note: onCallNote,
    button: "Book an on-call visit",
  },
});

const cell = (label: string) => ({ kind: "text", label, max: 28 }) as const;

/** Warranty | Rental | AMC plans | On-call: the heading, the table's wording and its note. */
export const amcCover = defineBlock({
  key: "amc.cover",
  label: "Warranty, rental, AMC or on-call",
  description:
    "The table comparing how each kind of cover looks after a purifier. Ticks and dashes stay as designed, and the AMC column’s visits and discounts and the on-call visit price follow AMC plans; every other cell is here.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 38 },
    title: {
      kind: "text",
      label: "Heading",
      max: 40,
      marks: "one",
      hint: "Wrap the words shown in blue in *asterisks*, like *looks after you*.",
    },
    description: { kind: "text", label: "Text", max: 48 },
    link: { kind: "text", label: "Link after the text (opens Rental)", max: 20 },
    columns: {
      kind: "cards",
      label: "Columns",
      count: [4, 4],
      reorder: false,
      itemLabel: "Column",
      itemNames: coverColumns.map((column) => column.name),
      item: {
        name: { kind: "text", label: "Name", max: 14 },
        detail: { kind: "text", label: "Line under the name", max: 40 },
      },
    },
    rows: {
      kind: "list",
      label: "Rows",
      count: [7, 7],
      max: 28,
      reorder: false,
      itemLabel: "Row",
      itemNames: coverText.rows,
      hint: "Each row keeps its ticks, dashes and figures, so the rows stay in their places.",
    },
    breakdownWarranty: cell("Breakdown support: Warranty"),
    breakdownOnCall: cell("Breakdown support: On-call"),
    labourWarranty: cell("Technician labour: Warranty"),
    labourOnCall: cell("Technician labour: On-call"),
    filtersWarranty: cell("Filters: Warranty"),
    filtersRental: cell("Filters: Rental"),
    filtersOnCall: cell("Filters: On-call"),
    partsWarranty: cell("Spare parts: Warranty"),
    partsOnCall: cell("Spare parts: On-call"),
    contractWarranty: cell("Contract: Warranty"),
    contractRental: cell("Contract: Rental"),
    contractAmc: cell("Contract: AMC plans"),
    contractOnCall: cell("Contract: On-call"),
    bestForWarranty: cell("Best for: Warranty"),
    bestForRental: cell("Best for: Rental"),
    bestForAmc: cell("Best for: AMC plans"),
    bestForOnCall: cell("Best for: On-call"),
    footnote: { kind: "text", label: "Note under the table", max: 220, multiline: true },
  },
  defaults: {
    eyebrow: "Warranty, rental, AMC or on-call",
    title: "How each option *looks after you*",
    description: "From the day you buy or rent a purifier.",
    link: "See rental",
    columns: coverColumns.map(({ name, detail }) => ({ name, detail })),
    ...coverText,
    rows: [...coverText.rows],
    footnote: coverFootnote,
  },
});

export const amcFaq = defineBlock({
  key: "amc.faq",
  label: "Questions",
  description: "The heading of the questions block. The AMC questions are written from AMC plans, so their answers always match the prices.",
  fields: {
    title: { kind: "text", label: "Heading", max: 28 },
  },
  defaults: {
    title: "AMC questions, answered",
  },
});

export const amcCta = ctaBlock("amc.ctaBand", "Closing call to action", {
  eyebrow: "Start your AMC",
  title: ["Start with a plan", "that fits your purifier."],
  description: "Choose a plan and share your purifier model, installation address and contact details. We’ll confirm eligibility, any charges and the activation date before arranging your service schedule.",
  button: "Request an AMC",
});

export const blocks: AnyBlock[] = [
  amcSeo,
  amcHero,
  amcStrip,
  amcPlansHeading,
  amcPlansCopy,
  amcPlanCards,
  amcCompare,
  amcValue,
  amcFilters,
  amcWhy,
  amcRoutineCopy,
  amcTermsCopy,
  amcOnCall,
  amcCover,
  amcFaq,
  amcCta,
];
