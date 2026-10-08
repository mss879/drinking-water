import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Find my solution: its editable text. Every block's defaults are the page's wording as designed. */

export const finderSeo = seoBlock("finder", {
  title: "Find My Solution: UF or RO Water Purifier",
  description:
    "Answer three quick questions about where you live, your water source and what you need. LUSAKO recommends UF or RO and the right water purification system.",
});

export const finderHero = defineBlock({
  key: "finder.hero",
  label: "Hero",
  description: "The label, headline and intro over the water-test photo.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 24 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 24,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each on its own line. Wrap the words shown in blue in *asterisks*, like *three questions*.",
    },
    description: { kind: "text", label: "Intro", max: 137 },
  },
  defaults: {
    eyebrow: "Find my solution",
    title: ["The right system in", "*three questions*"],
    description: "Tell us where you live, your water source and what you need. We’ll recommend UF or RO and the right LUSAKO system.",
  },
});

const answer = {
  label: { kind: "text", label: "Answer", max: 24 },
  hint: { kind: "text", label: "Line under it", max: 52 },
} as const;

/**
 * The three questions and their answers. What each answer leads to (UF or RO, buy, rent or corporate) stays in the
 * code, so the answers keep their places.
 */
export const finderQuestions = defineBlock({
  key: "finder.questions",
  label: "The three questions",
  description:
    "Each question, the line under it, its short name over the progress bar and its answers. What each answer leads to stays as it is, so answers can’t be added or reordered.",
  fields: {
    questions: {
      kind: "cards",
      label: "Questions",
      count: [3, 3],
      reorder: false,
      itemLabel: "Question",
      itemNames: ["Question 1: where you live", "Question 2: your water source", "Question 3: what you need"],
      item: {
        title: { kind: "text", label: "Question", max: 30 },
        help: { kind: "text", label: "Line under it", max: 62 },
        short: { kind: "text", label: "Short name over the progress bar", max: 16 },
      },
    },
    regions: {
      kind: "cards",
      label: "Question 1: answers",
      count: [2, 2],
      reorder: false,
      itemLabel: "Answer",
      itemNames: ["Western Province (no Regional Hydration Service)", "Anywhere else in Sri Lanka"],
      item: answer,
    },
    sources: {
      kind: "cards",
      label: "Question 2: answers",
      count: [3, 3],
      reorder: false,
      itemLabel: "Answer",
      itemNames: ["City water (recommends UF)", "Well water (recommends RO)", "Other or not sure (recommends RO and a water check)"],
      item: answer,
    },
    needs: {
      kind: "cards",
      label: "Question 3: answers",
      count: [3, 3],
      reorder: false,
      itemLabel: "Answer",
      itemNames: ["Home (recommends buying)", "Office (recommends renting)", "Commercial (recommends a corporate proposal)"],
      item: answer,
    },
    note: { kind: "text", label: "Small print under the first question", max: 50 },
  },
  defaults: {
    questions: [
      { title: "Where do you live?", help: "Choose the area where the system will be installed.", short: "Location" },
      { title: "What is your water source?", help: "Pick the supply the system will connect to.", short: "Water source" },
      { title: "What do you need?", help: "Tell us who the water is for.", short: "Your space" },
    ],
    regions: [
      { label: "Western Province", hint: "Colombo, Gampaha or Kalutara district" },
      { label: "Other province", hint: "Anywhere else in Sri Lanka" },
    ],
    sources: [
      { label: "City water", hint: "Treated pipe-borne (mains) supply" },
      { label: "Well water", hint: "A dug or tube well on the property" },
      { label: "Other or not sure", hint: "Mixed supply, or you’d like us to check" },
    ],
    needs: [
      { label: "Home", hint: "Pure water for your family" },
      { label: "Office", hint: "Hydration for your team at work" },
      { label: "Commercial", hint: "Factories, hotels, schools or several sites" },
    ],
    note: "Three quick questions. No sign-up needed.",
  },
});

/** The recommendation's headline and the reasons listed under it (lib/recommend.ts picks which ones apply). */
export const finderRecommendation = defineBlock({
  key: "finder.recommendation",
  label: "Recommendation: headline and reasons",
  description:
    "The headline of the recommendation and the reasons listed under it. Every recommendation gives a reason for the water source and one for the kind of space; rentals and corporate proposals outside the Western Province add the regional one.",
  fields: {
    headline: {
      kind: "text",
      label: "Headline",
      max: 32,
      tokens: ["{product}", "{plan}"],
      hint: "{product} is the purifier recommended for the visitor’s space (chosen in Products) and {plan} is the plan for their water (PureFlow UF or RO, named in Rental › Rental plans).",
    },
    cityWater: { kind: "text", label: "Reason for city water", max: 70 },
    wellWater: { kind: "text", label: "Reason for well water", max: 85 },
    otherWater: { kind: "text", label: "Reason for other or not sure", max: 105 },
    home: { kind: "text", label: "Reason for a home (buy)", max: 115 },
    office: { kind: "text", label: "Reason for an office (rent)", max: 130 },
    commercial: { kind: "text", label: "Reason for commercial (corporate proposal)", max: 132 },
    regional: { kind: "text", label: "Extra reason outside the Western Province (rent and corporate)", max: 132 },
  },
  defaults: {
    headline: "LUSAKO {product} – {plan}",
    cityWater: "Treated city water: UF purification is the right match.",
    wellWater: "Well water often has higher dissolved solids (TDS): RO is recommended.",
    otherWater: "We’ll confirm with a quick water check. RO covers the widest range of water conditions.",
    home: "For homes, owning your system is the best long-term value, backed by warranty and LUSAKO Care.",
    office: "For offices, rental removes the upfront investment and the maintenance, for one predictable monthly payment.",
    commercial: "For organisations, a Corporate Hydration proposal covers every unit and every site, with one account manager.",
    regional: "Outside the Western Province, the Regional Hydration Service is added as a separate, clearly shown line item.",
  },
});

/** The rest of the result screen: its labels, tags, the water-check note and the buttons (their links stay in code). */
export const finderResult = defineBlock({
  key: "finder.result",
  label: "Recommendation: labels and buttons",
  description:
    "Everything else on the result screen: the labels over it, the tag for buy, rent or corporate, the water-check note and the buttons. Where the buttons lead stays as it is.",
  fields: {
    progress: { kind: "text", label: "Label over the progress bar", max: 24 },
    progressNote: { kind: "text", label: "Line beside it", max: 26 },
    pill: { kind: "text", label: "Tag above the headline", max: 26 },
    buyTag: { kind: "text", label: "Home: tag beside the plan name", max: 26 },
    rentTag: { kind: "text", label: "Office: tag beside the plan name", max: 32 },
    corporateTag: { kind: "text", label: "Commercial: tag beside the plan name", max: 34 },
    rentWithPrice: {
      kind: "text",
      label: "Office: rental line while the price is shown",
      max: 30,
      tokens: ["{price}"],
      hint: "Shown under the tags only while the recommended plan’s price is switched on in Prices & quotes. {price} is that price, written like “LKR 4,990/month + VAT”.",
    },
    waterCheckTitle: { kind: "text", label: "Water-check note: title", max: 34 },
    waterCheckText: {
      kind: "text",
      label: "Water-check note: text",
      max: 141,
      hint: "Shown when the visitor answers “Other or not sure” for their water source.",
    },
    buyButton: { kind: "text", label: "Home: button (opens the quote form)", max: 32 },
    rentButton: { kind: "text", label: "Office: button (opens the rental quote form)", max: 24 },
    corporateButton: { kind: "text", label: "Commercial: button (opens the business quote form)", max: 29 },
    viewButton: {
      kind: "text",
      label: "Second button (opens the purifier’s page)",
      max: 20,
      tokens: ["{name}"],
      hint: "{name} is the recommended purifier’s name.",
    },
  },
  defaults: {
    progress: "Your recommendation",
    progressNote: "Based on your answers",
    pill: "Recommended solution",
    buyTag: "Buy · own your system",
    rentTag: "Rent · one monthly payment",
    corporateTag: "Corporate hydration proposal",
    rentWithPrice: "Rental from {price}",
    waterCheckTitle: "We’ll check your water first",
    waterCheckText:
      "When you request a quote, our team confirms UF or RO with a water check, where offered, before anything is installed.",
    buyButton: "Get a quote for this system",
    rentButton: "Get my rental quote",
    corporateButton: "Request a business quote",
    viewButton: "View {name}",
  },
});

/** What the quiz (components/forms/find-my-solution.tsx) needs, read on the page and passed in. */
export type FinderCopy = {
  questions: typeof finderQuestions.defaults;
  result: typeof finderResult.defaults;
  recommendation: typeof finderRecommendation.defaults;
};

/** "Why we ask": the heading beside the three reason cards. Each card keeps its icon by position. */
export const finderWhy = defineBlock({
  key: "finder.why",
  label: "Why we ask",
  description: "The heading under the quiz and the three cards beside it. Each card keeps its icon.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 20 },
    title: { kind: "text", label: "Heading", max: 72 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [3, 3],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["Card 1 (map pin icon)", "Card 2 (water drops icon)", "Card 3 (people icon)"],
      item: {
        title: { kind: "text", label: "Title", max: 22 },
        body: { kind: "text", label: "Text", max: 152 },
      },
    },
  },
  defaults: {
    eyebrow: "Why we ask",
    title: "Three answers are all it takes to recommend the right system.",
    cards: [
      {
        title: "Where you live",
        body: "Outside the Western Province, rentals include a Regional Hydration Service for regional support, always shown as its own line.",
      },
      {
        title: "Your water source",
        body: "Treated city water suits UF. Well water and water with higher dissolved solids (TDS) usually need RO.",
      },
      {
        title: "What you need",
        body: "Homes are best served by owning a system, offices by rental, and larger organisations by a corporate proposal.",
      },
    ],
  },
});

/** The dark "Prefer to talk it through?" band at the end of the page. The phone number and hours come from Contact & social. */
export const finderTalk = defineBlock({
  key: "finder.talk",
  label: "Prefer to talk it through?",
  description: "The dark band at the end of the page. The phone number, WhatsApp number and opening hours are in Contact & social.",
  fields: {
    title: { kind: "text", label: "Heading", max: 32 },
    text: {
      kind: "text",
      label: "Text",
      max: 108,
      marks: "one",
      hint: "The words in *asterisks* link to the Contact page.",
    },
    whatsappButton: { kind: "text", label: "Second button (opens WhatsApp)", max: 20 },
  },
  defaults: {
    title: "Prefer to talk it through?",
    text: "Our team can recommend a system by phone or on WhatsApp, or you can *send us an enquiry*.",
    whatsappButton: "WhatsApp us",
  },
});

export const blocks: AnyBlock[] = [finderSeo, finderHero, finderQuestions, finderRecommendation, finderResult, finderWhy, finderTalk];
