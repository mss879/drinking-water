import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Hydration solutions: its editable text. Every block's defaults are the page's wording as designed. */

export const hydrationSeo = seoBlock("hydration", {
  title: "Hydration Solutions",
  description:
    "LUSAKO Hydration Solutions: buy a water purifier for your home, rent for your office, or let LUSAKO manage drinking water across your whole organisation.",
});

/** The page's header: label, two-line headline, intro and its two buttons (their destinations stay in the code). */
export const hydrationHero = defineBlock({
  key: "hydration.hero",
  label: "Hero",
  description: "The label, headline, line under it and the two buttons over the photo at the top of the page.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 31 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 26,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two lines, each rising in on its own. Wrap words in *asterisks* to set them in blue, like the whole second line today.",
    },
    description: { kind: "text", label: "Intro", max: 143 },
    chooseButton: { kind: "text", label: "First button (opens Find my solution)", max: 20 },
    quoteButton: { kind: "text", label: "Second button (opens Contact)", max: 20 },
  },
  defaults: {
    eyebrow: "LUSAKO Hydration Solutions",
    title: ["Better water,", "*the way that suits you*"],
    description: "Buy a purifier for your home, rent for your office, or let LUSAKO manage drinking water across your whole organisation.",
    chooseButton: "Help me choose",
    quoteButton: "Get a quote",
  },
});

/** "Buy | Rent | Corporate": the heading and the three model cards. Each card keeps its colours and its link. */
export const hydrationModels = defineBlock({
  key: "hydration.models",
  label: "Buy, rent or corporate",
  description:
    "The heading over the three cards and each card’s wording. The cards keep their order, colours and where their links lead.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 27 },
    title: {
      kind: "text",
      label: "Heading",
      max: 65,
      marks: "one",
      hint: "The blue part stays together on one line.",
    },
    description: { kind: "text", label: "Text beside the heading", max: 194 },
    terms: {
      kind: "list",
      label: "Row labels (the same on all three cards)",
      count: [3, 3],
      max: 20,
      reorder: false,
      itemLabel: "Row",
      itemNames: ["First row (how you pay)", "Second row (who it suits)", "Third row (looking after it)"],
      hint: "Set in small capitals above each row’s text.",
    },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [3, 3],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["Buy (opens Water purifiers)", "Rent (opens Rental)", "Corporate (opens Corporate hydration)"],
      hint: "While the PureFlow UF monthly price is switched on in Prices & quotes, the Rent card’s first row uses the wording below instead.",
      item: {
        label: { kind: "text", label: "Title", max: 10 },
        audience: { kind: "text", label: "Who it’s for", max: 20 },
        promise: { kind: "text", label: "Promise", max: 66 },
        pay: { kind: "text", label: "First row (how you pay)", max: 45 },
        bestFor: { kind: "text", label: "Second row (who it suits)", max: 42 },
        care: { kind: "text", label: "Third row (looking after it)", max: 99 },
        cta: { kind: "text", label: "Link", max: 20 },
      },
    },
    rentPayWithPrice: {
      kind: "text",
      label: "Rent card: first row when the PureFlow UF price is shown",
      max: 40,
      tokens: ["{price}"],
      hint: "Used instead of the Rent card’s first row while the PureFlow UF monthly price is switched on in Prices & quotes.",
    },
  },
  defaults: {
    eyebrow: "Buy | Rent | Corporate",
    title: "Rental is how you pay. *Hydration is what we deliver.*",
    description:
      "Buying, renting and corporate contracts describe how you pay for and use the equipment. A hydration solution is the complete service and outcome LUSAKO provides.",
    terms: ["How you pay", "Best for", "Looking after it"],
    cards: [
      {
        label: "Buy",
        audience: "For homes",
        promise: "Own your water purification system.",
        pay: "A one-time purchase",
        bestFor: "Homes and long-term ownership",
        care: "Product warranty, with LUSAKO Care service plans and AMC available",
        cta: "Explore purifiers",
      },
      {
        label: "Rent",
        audience: "For offices",
        promise: "Complete hydration for one predictable monthly payment.",
        pay: "One predictable monthly payment",
        bestFor: "Offices and companies",
        care: "Installation, maintenance and support according to your rental agreement",
        cta: "Explore rental",
      },
      {
        label: "Corporate",
        audience: "For organisations",
        promise: "One partner for your organisation’s drinking water.",
        pay: "A custom quotation for multiple units",
        bestFor: "Organisations with one site or many",
        care: "Maintenance and support according to contract, with centralised account management",
        cta: "Talk to our team",
      },
    ],
    rentPayWithPrice: "Monthly, from {price}/month + VAT",
  },
});

/** LUSAKO Care: the photo's caption, the heading, the note under the services and the two buttons. */
export const hydrationCare = defineBlock({
  key: "hydration.care",
  label: "LUSAKO Care",
  description:
    "The caption on the technician photo, the heading and text beside it, the note under the services and the two buttons. The services’ names are in Shared sections › LUSAKO Care services.",
  fields: {
    captionTitle: { kind: "text", label: "Photo caption: title", max: 20 },
    captionText: { kind: "text", label: "Photo caption: line", max: 42 },
    eyebrow: { kind: "text", label: "Label above the heading", max: 20 },
    title: { kind: "text", label: "Heading", max: 47, marks: "one" },
    description: { kind: "text", label: "Text", max: 212 },
    note: { kind: "text", label: "Note under the services", max: 84 },
    careButton: { kind: "text", label: "First button (opens Service & support)", max: 24 },
    serviceButton: { kind: "text", label: "Second button (opens the service request form)", max: 24 },
  },
  defaults: {
    captionTitle: "LUSAKO Care",
    captionText: "Installation, maintenance & support",
    eyebrow: "LUSAKO Care",
    title: "Looked after, *long after installation*",
    description:
      "Service is what makes LUSAKO a hydration partner rather than an appliance retailer. Whether you buy, rent or run a corporate contract, LUSAKO Care keeps your system performing.",
    note: "Provided according to your warranty, service plan or rental agreement.",
    careButton: "Explore LUSAKO Care",
    serviceButton: "Request a service",
  },
});

export const blocks: AnyBlock[] = [hydrationSeo, hydrationHero, hydrationModels, hydrationCare];
