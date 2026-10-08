import { purifiersCard } from "./purifiers-card";
import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Water purifiers: its editable text. Every block's defaults are the page's wording as designed. */

export const purifiersSeo = seoBlock("purifiers", {
  title: "Water Purifiers in Sri Lanka – UF & RO",
  description:
    "Buy a LUSAKO water purifier in Sri Lanka: countertop, freestanding, under-sink, wall-mount and sparkling systems with UF or RO, installation and warranty.",
});

export const purifiersHero = defineBlock({
  key: "purifiers.hero",
  label: "Hero",
  description: "The label, headline and intro over the water photo, and the two buttons.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 26 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 20,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each set on its own line. The words in *asterisks* are shown in blue, like *better water*.",
    },
    description: { kind: "text", label: "Intro", max: 170, multiline: true },
    quoteButton: { kind: "text", label: "First button (opens the quote form)", max: 20 },
    finderButton: { kind: "text", label: "Second button (opens Find my solution)", max: 20 },
  },
  defaults: {
    eyebrow: "LUSAKO Water Purifiers",
    title: ["Own", "*better water*"],
    description:
      "Invest once in a LUSAKO purification system and enjoy reliable purified water for years. Find the right system for your water and lifestyle.",
    quoteButton: "Get a quote",
    finderButton: "Find my solution",
  },
});

export const purifiersCatalogue = defineBlock({
  key: "purifiers.catalogue",
  label: "Catalogue heading",
  description: "The heading over the purifiers. The purifiers themselves are in Products.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 26, marks: "one" },
    description: { kind: "text", label: "Text", max: 156, multiline: true },
  },
  defaults: {
    eyebrow: "Catalogue",
    title: "Choose your *purifier*",
    description:
      "Countertop, freestanding, under-sink, wall-mount and sparkling purifiers. Filter by type or purification, or let us recommend one.",
  },
});

export const purifiersCatalogueMessages = defineBlock({
  key: "purifiers.catalogueMessages",
  label: "Catalogue: filter link and messages",
  description:
    "The link beside the purification filter, the count line under the filters, and what the catalogue says when a filter finds nothing or a category has no purifiers listed yet. The filter names stay as they are.",
  fields: {
    helpLink: { kind: "text", label: "Link beside the purification filter (jumps to UF or RO?)", max: 26 },
    statusAll: {
      kind: "text",
      label: "Count line: every purifier shown",
      max: 34,
      tokens: ["{total}"],
      hint: "{total} is the number of purifiers.",
    },
    statusSome: {
      kind: "text",
      label: "Count line: some purifiers shown",
      max: 42,
      tokens: ["{count}", "{total}"],
      hint: "{count} is how many match the filters, {total} the number of purifiers.",
    },
    statusNone: { kind: "text", label: "Count line: nothing matches", max: 38 },
    statusOnRequest: {
      kind: "text",
      label: "Count line: a category with no purifiers listed yet",
      max: 40,
      tokens: ["{types}"],
      hint: "{types} is the category, such as “Countertop purifiers”.",
    },
    onRequestTitle: {
      kind: "text",
      label: "No purifiers listed yet: heading",
      max: 24,
      tokens: ["{types}"],
      hint: "{types} is the category, such as “Countertop purifiers”.",
    },
    onRequestBody: {
      kind: "text",
      label: "No purifiers listed yet: text",
      max: 122,
      multiline: true,
      tokens: ["{type}"],
      hint: "{type} is the category in lower case, such as “countertop”.",
    },
    onRequestButton: {
      kind: "text",
      label: "No purifiers listed yet: first button (opens the quote form)",
      max: 22,
      tokens: ["{types}"],
      hint: "{types} is the category in lower case, such as “countertop purifiers”.",
    },
    onRequestAllButton: { kind: "text", label: "No purifiers listed yet: second button (shows every purifier)", max: 22 },
    noMatchTitle: { kind: "text", label: "Nothing matches: heading", max: 38 },
    noMatchReason: {
      kind: "text",
      label: "Nothing matches: text",
      max: 60,
      tokens: ["{types}", "{options}"],
      hint: "{types} is the category, such as “Sparkling purifiers”; {options} is the purification it comes with, such as “UF” or “UF or RO”.",
    },
    noMatchNoPurification: {
      kind: "text",
      label: "Nothing matches: text when the category has no UF or RO purifiers",
      max: 48,
      tokens: ["{types}"],
      hint: "{types} is the category, such as “Sparkling purifiers”.",
    },
    noMatchAny: { kind: "text", label: "Nothing matches: text when the type is All", max: 40 },
    clearButton: { kind: "text", label: "Nothing matches: first button (clears the filters)", max: 18 },
    showTypeButton: {
      kind: "text",
      label: "Nothing matches: second button (shows the whole category)",
      max: 22,
      tokens: ["{types}"],
      hint: "{types} is the category in lower case, such as “sparkling purifiers”.",
    },
  },
  defaults: {
    helpLink: "What’s the difference?",
    statusAll: "Showing all {total} products",
    statusSome: "Showing {count} of {total} products",
    statusNone: "No products match these filters",
    statusOnRequest: "{types} are available on request",
    onRequestTitle: "{types}, on request",
    onRequestBody: "Tell us about your space and your water, and our team will recommend the right {type} model and price.",
    onRequestButton: "Ask about {types}",
    onRequestAllButton: "See all purifiers",
    noMatchTitle: "No matches for that combination",
    noMatchReason: "{types} are available with {options} purification.",
    noMatchNoPurification: "{types} don’t use UF or RO purification.",
    noMatchAny: "Try another type or purification.",
    clearButton: "Clear filters",
    showTypeButton: "Show all {types}",
  },
});



export const purifiersDecision = defineBlock({
  key: "purifiers.decision",
  label: "“Which purifier is right for me?” card",
  description: "The card under the purifiers that leads to Find my solution, with its three numbered questions.",
  fields: {
    title: { kind: "text", label: "Heading", max: 38 },
    body: { kind: "text", label: "Text", max: 118, multiline: true },
    questions: {
      kind: "list",
      label: "Questions",
      count: [3, 3],
      max: 32,
      itemLabel: "Question",
      hint: "The three questions Find my solution asks, numbered 1 to 3.",
    },
    button: { kind: "text", label: "Button (opens Find my solution)", max: 20 },
  },
  defaults: {
    title: "Which purifier is right for me?",
    body: "Answer three quick questions and we’ll recommend the right system and purification for your water.",
    questions: ["Where do you live?", "What is your water source?", "What do you need?"],
    button: "Find my solution",
  },
});

export const purifiersNext = defineBlock({
  key: "purifiers.next",
  label: "Where next: the two link cards",
  description: "The two cards under the decision card. Each keeps its icon and link.",
  fields: {
    cards: {
      kind: "cards",
      label: "Cards",
      count: [2, 2],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["Card 1 (opens Functional water)", "Card 2 (opens Filters, parts & accessories)"],
      item: {
        title: { kind: "text", label: "Title", max: 34 },
        body: { kind: "text", label: "Text", max: 58 },
      },
    },
  },
  defaults: {
    cards: [
      { title: "Functional water", body: "Sparkling, hydrogen and alkaline water on tap." },
      { title: "Filters, parts & accessories", body: "Genuine cartridges, spare parts and accessories." },
    ],
  },
});

export const purifiersWhyBuy = defineBlock({
  key: "purifiers.whyBuy",
  label: "Why buy",
  description: "The heading and the five reasons to own a system. Each reason keeps its icon, so they can’t be reordered.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 30, marks: "one", hint: "The blue words stay together on one line." },
    description: { kind: "text", label: "Text", max: 175, multiline: true },
    reasons: {
      kind: "cards",
      label: "Reasons",
      count: [5, 5],
      reorder: false,
      itemLabel: "Reason",
      itemNames: [
        "Reason 1 (key icon)",
        "Reason 2 (piggy bank icon)",
        "Reason 3 (badge icon)",
        "Reason 4 (water drops icon)",
        "Reason 5 (shield icon)",
      ],
      item: {
        title: { kind: "text", label: "Title", max: 24 },
        body: { kind: "text", label: "Text", max: 150 },
      },
    },
  },
  defaults: {
    eyebrow: "Why buy",
    title: "Why own a *LUSAKO system*",
    description:
      "For most homes, buying is the best long-term value. The system is yours, it’s covered by warranty, and LUSAKO Care is there whenever you need us.",
    reasons: [
      { title: "Yours to keep", body: "Buy once and the system is yours, with no monthly rental to pay." },
      {
        title: "Long-term value",
        body: "Invest once and enjoy reliable purified water for years, with no more bottled-water deliveries.",
      },
      {
        title: "Product quality",
        body: "Premium countertop, freestanding, under-sink, wall-mount and sparkling systems, designed for everyday use at home and at work.",
      },
      {
        title: "The right technology",
        body: "UF or RO purification, matched to your water source. We recommend the right one, so you don’t have to be a water expert.",
      },
      { title: "Warranty cover", body: "Every purchased system comes with a product warranty, shown on each product page." },
    ],
  },
});

export const purifiersCare = defineBlock({
  key: "purifiers.care",
  label: "LUSAKO Care card",
  description: "The dark card that closes Why buy and opens Service & support.",
  fields: {
    title: { kind: "text", label: "Title", max: 20 },
    body: { kind: "text", label: "Text", max: 180, multiline: true },
  },
  defaults: {
    title: "LUSAKO Care",
    body: "After-sales support whenever you need it: installation, preventive maintenance, filter replacement and technical support through a service plan or AMC.",
  },
});

export const purifiersUfOrRo = defineBlock({
  key: "purifiers.ufOrRo",
  label: "UF or RO?",
  description:
    "The section that matches the water source to UF or RO, with its two cards. The UF and RO badges stay as they are.",
  fields: {
    pill: { kind: "text", label: "Pill", max: 16 },
    title: { kind: "text", label: "Heading", max: 28, marks: "one" },
    description: { kind: "text", label: "Text", max: 140, multiline: true },
    button: { kind: "text", label: "Button (opens Find my solution)", max: 20 },
    cardLead: { kind: "text", label: "Small line above each water source", max: 16 },
    matches: {
      kind: "cards",
      label: "Cards",
      count: [2, 2],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["UF (city water)", "RO (well water)"],
      hint: "Each card’s text opens with the purification’s name in bold: wrap those words in *asterisks*, like *Ultrafiltration.*",
      item: {
        source: { kind: "text", label: "Water source", max: 28 },
        body: { kind: "text", label: "Text", max: 150, marks: "one" },
      },
    },
    footnote: { kind: "text", label: "Note under the cards", max: 100 },
  },
  defaults: {
    pill: "UF or RO?",
    title: "Matched to *your water*",
    description: "You don’t need to be a water expert. Tell us where your water comes from and we’ll recommend the right purification.",
    button: "Check my water",
    cardLead: "If you have",
    matches: [
      {
        source: "City water",
        body: "*Ultrafiltration.* A fine membrane removes particles, sediment and microorganisms while keeping naturally occurring minerals.",
      },
      {
        source: "Well water / higher TDS",
        body: "*Reverse osmosis.* A much finer membrane also reduces dissolved salts and other dissolved solids (TDS).",
      },
    ],
    footnote: "RO also suits city water. The final recommendation depends on your water condition.",
  },
});

export const purifiersFaqs = defineBlock({
  key: "purifiers.faqs",
  label: "Questions",
  description:
    "This page’s heading for the questions block (the other pages’ heading is in Shared sections). The questions are the buying and purification ones in FAQs.",
  fields: {
    title: { kind: "text", label: "Heading", max: 32 },
  },
  defaults: {
    title: "Questions, answered",
  },
});

export { purifiersCard };

export const blocks: AnyBlock[] = [
  purifiersSeo,
  purifiersHero,
  purifiersCatalogue,
  purifiersCatalogueMessages,
  purifiersCard,
  purifiersDecision,
  purifiersNext,
  purifiersWhyBuy,
  purifiersCare,
  purifiersUfOrRo,
  purifiersFaqs,
];
