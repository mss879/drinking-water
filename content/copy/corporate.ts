import { leadForms } from "../forms";
import { defineBlock, seoBlock, type AnyBlock } from "./schema";
import { ctaBlock } from "./shared";

/** Corporate hydration: its editable text. Every block's defaults are the page's wording as designed. */

export const corporateSeo = seoBlock("corporate", {
  title: "Corporate Hydration Solutions",
  description:
    "One partner for workplace hydration: consultation, UF or RO recommendation, installation, preventive maintenance and account management, for one site or many.",
});

/** The page's header: label, two-line headline, intro and its two buttons (their destinations stay in the code). */
export const corporateHero = defineBlock({
  key: "corporate.hero",
  label: "Hero",
  description: "The label, headline, line under it and the two buttons over the photo at the top of the page.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 35 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 24,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two lines, each rising in on its own. Wrap words in *asterisks* to set them in blue, like the whole second line today.",
    },
    description: { kind: "text", label: "Intro", max: 144 },
    quoteButton: { kind: "text", label: "First button (jumps to the business quote form)", max: 28 },
    callButton: {
      kind: "text",
      label: "Second button (calls the first phone number)",
      max: 20,
      hint: "Shown when a phone number is set in Contact & social.",
    },
  },
  defaults: {
    eyebrow: "Corporate Hydration Solutions",
    title: ["One partner for your", "*workplace hydration*"],
    description: "One solution for your entire workplace. For offices, factories, hotels, schools, hospitals and commercial organisations.",
    quoteButton: "Request a business quote",
    callButton: "Call our team",
  },
});

/** The strip right under the hero: one line that sums the page up, a sentence and its tags. */
export const corporateStrip = defineBlock({
  key: "corporate.strip",
  label: "Strip under the hero",
  description: "The line, sentence and tags in the strip just below the hero.",
  fields: {
    title: { kind: "text", label: "Line", max: 46 },
    description: { kind: "text", label: "Sentence", max: 88 },
    pills: { kind: "list", label: "Tags", count: [1, 4], max: 18, itemLabel: "Tag" },
  },
  defaults: {
    title: "Your hydration infrastructure, managed",
    description: "From consultation and installation to maintenance and account management.",
    pills: ["Single office", "Multi-location"],
  },
});

/** "One location or many": the heading and the two cards (the first shows one map pin, the second three). */
export const corporateScale = defineBlock({
  key: "corporate.scale",
  label: "One location or many",
  description: "The heading and the two cards for a single site and for many sites. Each card keeps its map pins.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 39 },
    title: { kind: "text", label: "Heading", max: 27, marks: "one" },
    description: { kind: "text", label: "Text beside the heading", max: 129 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [2, 2],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["One location (one map pin)", "Multiple locations (three map pins)"],
      item: {
        title: { kind: "text", label: "Title", max: 24 },
        body: { kind: "text", label: "Text", max: 92 },
        point1: { kind: "text", label: "Point 1", max: 66 },
        point2: { kind: "text", label: "Point 2", max: 66 },
        point3: { kind: "text", label: "Point 3", max: 66 },
      },
    },
  },
  defaults: {
    eyebrow: "Single-office and multi-location",
    title: "One location or *many*",
    description: "Whether you run one office or many branches, LUSAKO plans and looks after the drinking water at every site.",
    cards: [
      {
        title: "One location",
        body: "A complete hydration setup for a single office, factory, hotel or school.",
        point1: "Consultation based on your number of users",
        point2: "UF or RO, matched to your water source",
        point3: "Maintenance and support according to contract",
      },
      {
        title: "Multiple locations",
        body: "Consistent hydration across every branch and site, planned as one programme.",
        point1: "Machines selected site by site, by expected consumption",
        point2: "Installation and service planning across locations",
        point3: "Centralised account management",
      },
    ],
  },
});

/** The deep blue statement band under the two cards, and its button. */
export const corporateStatement = defineBlock({
  key: "corporate.statement",
  label: "Statement band",
  description: "The large statement on the deep blue band under the two cards, and its button.",
  fields: {
    question: { kind: "text", label: "First line (light blue)", max: 39 },
    statement: { kind: "text", label: "Statement (white)", max: 63 },
    button: { kind: "text", label: "Button (jumps to the business quote form)", max: 28 },
  },
  defaults: {
    question: "Need 15 machines across 5 branches?",
    statement: "LUSAKO can manage your complete hydration infrastructure.",
    button: "Request a business quote",
  },
});

/** "What we manage": the heading and the eight capability cards (brief Doc 2 §12). Each card keeps its icon. */
export const corporateCapabilities = defineBlock({
  key: "corporate.capabilities",
  label: "What we manage",
  description: "The heading and the eight cards of what LUSAKO manages for an organisation. Each card keeps its icon.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 20 },
    title: { kind: "text", label: "Heading", max: 62, marks: "one" },
    description: { kind: "text", label: "Text beside the heading", max: 124 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [8, 8],
      reorder: false,
      itemLabel: "Card",
      itemNames: [
        "Card 1 (map icon)",
        "Card 2 (people icon)",
        "Card 3 (water drops icon)",
        "Card 4 (gauge icon)",
        "Card 5 (clipboard icon)",
        "Card 6 (spanner icon)",
        "Card 7 (account manager icon)",
        "Card 8 (receipt icon)",
      ],
      item: {
        title: { kind: "text", label: "Title", max: 53 },
        body: { kind: "text", label: "Text", max: 77 },
      },
    },
  },
  defaults: {
    eyebrow: "What we manage",
    title: "Everything your workplace needs, *from one partner*",
    description: "More than equipment: LUSAKO plans, installs and looks after drinking water for your whole organisation.",
    cards: [
      { title: "Single-office and multi-location solutions", body: "One site or many, planned and supported as a whole." },
      { title: "Employee and user-based consultation", body: "We size your solution around the people who use it." },
      { title: "UF or RO, matched to your water", body: "Recommended by water source and site conditions." },
      { title: "Machines matched to demand", body: "Selected for expected consumption and the environment." },
      { title: "Installation and service planning", body: "A clear plan for installation and ongoing service at every site." },
      { title: "Preventive maintenance and technical support", body: "Delivered according to your contract." },
      { title: "Centralised account management", body: "One point of contact for your corporate account." },
      { title: "Custom quotation", body: "A tailored quote for organisations that need multiple units." },
    ],
  },
});

/** "How it works": the heading and the five numbered steps (five columns on computers). */
export const corporateSteps = defineBlock({
  key: "corporate.steps",
  label: "How it works",
  description: "The heading and the five numbered steps, from consultation to ongoing care. The numbers follow the order.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 20 },
    title: { kind: "text", label: "Heading", max: 43, marks: "one" },
    steps: {
      kind: "cards",
      label: "Steps",
      count: [5, 5],
      itemLabel: "Step",
      hint: "Five steps sit side by side on computers, so keep each title short.",
      item: {
        title: { kind: "text", label: "Title", max: 48 },
        body: { kind: "text", label: "Text", max: 112 },
      },
    },
  },
  defaults: {
    eyebrow: "How it works",
    title: "From consultation to *ongoing care*",
    steps: [
      { title: "Consultation", body: "We learn about your sites, your teams and the number of users at each location." },
      { title: "UF or RO recommendation", body: "Based on each site’s water source and conditions." },
      { title: "Machine selection", body: "Matched to expected consumption and the environment." },
      { title: "Installation & service planning", body: "Professional installation, with a service plan for every site." },
      {
        title: "Preventive maintenance & account management",
        body: "Maintenance and technical support according to contract, with centralised account management.",
      },
    ],
  },
});

/** The sectors band's heading and line (the sectors themselves and their icons stay as they are). */
export const corporateSectors = defineBlock({
  key: "corporate.sectors",
  label: "Workplaces we serve",
  description: "The heading and line over the sectors on the light blue band. The sectors and their icons stay as they are.",
  fields: {
    title: { kind: "text", label: "Heading", max: 40 },
    description: { kind: "text", label: "Line", max: 65 },
  },
  defaults: {
    title: "Built for every kind of workplace",
    description: "From a single office to organisations with many sites.",
  },
});

/** The business quote section: its heading, the "Prefer to talk?" card and the form card's heading. */
export const corporateProposal = defineBlock({
  key: "corporate.proposal",
  label: "Business quote",
  description:
    "The heading and text beside the business quote form, the “Prefer to talk?” card and the heading on the form. The phone numbers, email and hours are in Contact & social; the form’s questions stay as they are.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 20 },
    title: { kind: "text", label: "Heading", max: 30, marks: "one" },
    description: {
      kind: "text",
      label: "Text",
      max: 130,
      hint: "Changes this page only: the Contact page’s corporate form keeps its own text.",
    },
    note: {
      kind: "text",
      label: "Note under the text",
      max: 86,
      hint: "Changes this page only: the message shown after the form is sent stays as it is.",
    },
    talkTitle: { kind: "text", label: "Contact card: title", max: 24 },
    formTitle: { kind: "text", label: "Form card: title", max: 38 },
    formIntro: { kind: "text", label: "Form card: line", max: 86 },
  },
  defaults: {
    eyebrow: "Business quote",
    title: "Request a *business quote*",
    description: leadForms.corporate.description,
    note: leadForms.corporate.successNote,
    talkTitle: "Prefer to talk?",
    formTitle: "Tell us about your organisation",
    formIntro: "Your sites, your teams and what you need. We’ll plan the rest with you.",
  },
});

/** The questions block's heading (the questions are in FAQs, marked "Show on Corporate hydration"). */
export const corporateFaq = defineBlock({
  key: "corporate.faq",
  label: "Questions",
  description: "The heading of the questions block. Choose which questions appear here in FAQs (Show on Corporate hydration).",
  fields: {
    title: { kind: "text", label: "Heading", max: 35 },
  },
  defaults: {
    title: "Corporate questions, answered",
  },
});

export const corporateCta = ctaBlock("corporate.ctaBand", "Closing call to action", {
  eyebrow: "Corporate Hydration Solutions",
  title: ["Let’s plan your", "workplace hydration"],
  description: "Tell us about your sites and your teams. A LUSAKO business consultant will prepare a proposal for your organisation.",
  button: "Get a proposal",
});

export const blocks: AnyBlock[] = [
  corporateSeo,
  corporateHero,
  corporateStrip,
  corporateScale,
  corporateStatement,
  corporateCapabilities,
  corporateSteps,
  corporateSectors,
  corporateProposal,
  corporateFaq,
  corporateCta,
];
