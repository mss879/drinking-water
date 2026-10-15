import { maintenanceNote } from "../products";
import { defineBlock, type AnyBlock } from "./schema";

/**
 * Product pages: the wording every product page shares. Every block's defaults are the page's wording as designed.
 * {name} is filled in with each product's name; the product's own text (tagline, summary, features, notes) is set in
 * Products, and its prices in Prices & quotes.
 *
 * Prices are filled in already written out with their terms, so the VAT wording stays as the brief has it: a buy
 * price reads “LKR 85,000 + VAT” and a monthly rental “LKR 4,990/month + VAT”.
 */


const nameHint = "{name} is the product’s name; it stays together on one line.";

/** The tags and buttons under the product's name in the hero. Where the buttons lead stays in the code. */
export const productHero = defineBlock({
  key: "product.hero",
  label: "Hero",
  description:
    "The tags and the two buttons beside the product’s photo. The name, tagline and photo are set in Products. While a price of the product is shown (Prices & quotes), its rent and buy prices take the place of the first two tags.",
  fields: {
    pill: { kind: "text", label: "White tag", max: 14 },
    warrantyPill: {
      kind: "text",
      label: "Warranty tag",
      max: 23,
      tokens: ["{warranty}"],
      hint: "{warranty} is the product’s warranty from Products, like “2 years”.",
    },
    rentPillWithPrice: {
      kind: "text",
      label: "Rent tag while a rent price is shown",
      max: 21,
      tokens: ["{price}"],
      hint: "{price} is the product’s lowest monthly rental, written like “LKR 4,990/month + VAT”.",
    },
    rentPillOnRequest: {
      kind: "text",
      label: "Rent tag while only a buy price is shown",
      max: 21,
    },
    buyPillWithPrice: {
      kind: "text",
      label: "Buy tag while a buy price is shown",
      max: 20,
      tokens: ["{price}"],
      hint: "For a product with more than one option. {price} is its lowest buy price, written like “LKR 85,000 + VAT”.",
    },
    buyPillWithPriceOne: {
      kind: "text",
      label: "Buy tag while a buy price is shown (product with one option)",
      max: 20,
      tokens: ["{price}"],
      hint: "{price} is its buy price, written like “LKR 85,000 + VAT”.",
    },
    buyPillOnRequest: { kind: "text", label: "Buy tag while only a rent price is shown", max: 27 },
    quoteButton: { kind: "text", label: "First button (goes to the buy and rent options)", max: 14 },
    rentButton: { kind: "text", label: "Second button (opens the rental form)", max: 18 },
  },
  defaults: {
    pill: "Buy or rent",
    warrantyPill: "{warranty} warranty",
    rentPillWithPrice: "Rent from {price}",
    rentPillOnRequest: "Rental on request",
    buyPillWithPrice: "Buy from {price}",
    buyPillWithPriceOne: "Buy {price}",
    buyPillOnRequest: "Buy · price on request",
    quoteButton: "Get a quote",
    rentButton: "Rent this model",
  },
});

/** The facts beside the buy and rent options, and the Find my solution line under them. */
export const productFacts = defineBlock({
  key: "product.facts",
  label: "Facts",
  description:
    "The labels of the four fact tiles under the product’s summary, the model numbers line and the line under the buy and rent options. The facts themselves are set in Products.",
  fields: {
    modelOne: { kind: "text", label: "Model numbers line: label (one model)", max: 10 },
    modelSeveral: { kind: "text", label: "Model numbers line: label (several models)", max: 10 },
    facts: {
      kind: "list",
      label: "Fact tiles: labels",
      count: [4, 4],
      max: 14,
      reorder: false,
      itemLabel: "Label",
      itemNames: ["Purification (drop icon)", "Water (thermometer icon)", "Installation (spanner icon)", "Warranty (shield icon)"],
      hint: "Set in small capitals in two narrow columns, so keep each to a word or two.",
    },
    notSure: { kind: "text", label: "Line under the options", max: 39 },
    finderLink: { kind: "text", label: "Link after it (opens Find my solution)", max: 20 },
  },
  defaults: {
    modelOne: "Model",
    modelSeveral: "Models",
    facts: ["Purification", "Water", "Installation", "Warranty"],
    notSure: "Not sure which is right for you?",
    finderLink: "Find my solution",
  },
});

/** The buy and rent options card (components/products/purchase-options.tsx), with KOKO's badge. */
export const productOptions = defineBlock({
  key: "product.options",
  label: "Buy and rent options",
  description:
    "The card where a visitor picks UF or RO and asks to buy or rent. Option names and model numbers are set in Products. While a price of the product is shown (Prices & quotes), each option shows its prices and the card says “All prices exclude VAT”.",
  fields: {
    titleSeveral: { kind: "text", label: "Heading (product with UF and RO options)", max: 29 },
    subtitleSeveral: { kind: "text", label: "Line beside it (product with UF and RO options)", max: 38 },
    titleOne: { kind: "text", label: "Heading (product with one option)", max: 15 },
    titleOneWithPrice: {
      kind: "text",
      label: "Heading (product with one option) while a price is shown",
      max: 24,
      tokens: ["{name}"],
      hint: "{name} is the product’s name.",
    },
    subtitleOne: { kind: "text", label: "Line beside it (product with one option)", max: 32 },
    ufFit: { kind: "text", label: "UF option: line under its name", max: 27 },
    roFit: { kind: "text", label: "RO option: line under its name", max: 35 },
    model: { kind: "text", label: "Option: model number", max: 16, tokens: ["{code}"], hint: "{code} is the option’s model number." },
    buyLabel: { kind: "text", label: "Option prices: buy label", max: 12, hint: "Shown on each option while a price of the product is shown." },
    buyOnRequest: { kind: "text", label: "Option prices: while its buy price is hidden", max: 20 },
    rentFromLabel: { kind: "text", label: "Option prices: rent label before a price", max: 12 },
    rentLabel: { kind: "text", label: "Option prices: rent label while its rent price is hidden", max: 12 },
    rentOnRequest: { kind: "text", label: "Option prices: while its rent price is hidden", max: 16 },
    buyText: {
      kind: "text",
      label: "Buy side: text",
      max: 45,
      tokens: ["{option}"],
      hint: "{option} is the chosen option, like “4-Stage UF”, or the product’s name when it has one.",
    },
    buyTextWithPrice: {
      kind: "text",
      label: "Buy side: text while the option’s buy price is shown",
      max: 34,
      tokens: ["{option}", "{price}"],
      hint: "{option} is the chosen option (or the product’s name) and {price} its buy price, written like “LKR 85,000 + VAT”.",
    },
    buyButton: { kind: "text", label: "Buy side: button (opens the quote form)", max: 14 },
    koko: {
      kind: "text",
      label: "KOKO badge: text before the logo",
      max: 30,
      hint: "Shown while the KOKO badge is switched on in Prices & quotes.",
    },
    rentText: {
      kind: "text",
      label: "Rent side: text",
      max: 65,
      hint: "Used while the option’s rent price and the initial payment are hidden.",
    },
    rentTextWithInitial: {
      kind: "text",
      label: "Rent side: text while only the initial payment is shown",
      max: 89,
      tokens: ["{initial}"],
      hint: "Used while the option’s rent price is hidden. {initial} is the initial payment per unit, like “LKR 6,000”.",
    },
    rentTextWithPrice: {
      kind: "text",
      label: "Rent side: text while the option’s rent price is shown",
      max: 60,
      tokens: ["{price}"],
      hint: "Used while the initial payment is hidden. {price} is the monthly rental, written like “LKR 4,990/month + VAT”.",
    },
    rentTextWithPrices: {
      kind: "text",
      label: "Rent side: text while its rent price and the initial payment are shown",
      max: 72,
      tokens: ["{price}", "{initial}"],
      hint: "{price} is the monthly rental, written like “LKR 4,990/month + VAT”, and {initial} the initial payment per unit.",
    },
    rentButton: { kind: "text", label: "Rent side: button (opens the rental form)", max: 14 },
  },
  defaults: {
    titleSeveral: "Choose your purification",
    subtitleSeveral: "Then get a quote to buy or rent",
    titleOne: "Purification",
    titleOneWithPrice: "{name} prices",
    subtitleOne: "Get a quote to buy or rent",
    ufFit: "For treated city water",
    roFit: "For well water and higher TDS",
    model: "Model {code}",
    buyLabel: "Buy",
    buyOnRequest: "Price on request",
    rentFromLabel: "Rent from",
    rentLabel: "Rent",
    rentOnRequest: "On request",
    buyText: "Buy the {option}, installed by LUSAKO",
    buyTextWithPrice: "Own the {option} for {price}",
    buyButton: "Get a quote",
    koko: "Pay in instalments with",
    rentText: "Rent it for one monthly payment, with service included",
    rentTextWithInitial: "Rent it for one monthly payment, plus a one-time {initial} initial payment",
    rentTextWithPrice: "Rent from {price}, plus a one-time initial payment",
    rentTextWithPrices: "Rent from {price}, plus a one-time {initial} initial payment",
    rentButton: "Get a quote",
  },
});

export const productFeatures = defineBlock({
  key: "product.features",
  label: "Features",
  description: "The heading over the feature cards. The highlight tags and the cards themselves are set in Products.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 28, marks: "one", tokens: ["{name}"], hint: `${nameHint} The blue part stays on one line too.` },
  },
  defaults: {
    eyebrow: "Features",
    title: "Why choose the *{name}*",
  },
});

export const productSpecs = defineBlock({
  key: "product.specs",
  label: "Specifications",
  description:
    "The heading, text and button beside the specifications table, and the labels of its standard rows. Extra rows for a product are added in Products.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 28,
      marks: "one",
      tokens: ["{name}"],
      hint: "{name} is the product’s name; it stays together on one line with any comma right after it.",
    },
    text: { kind: "text", label: "Text", max: 66 },
    button: { kind: "text", label: "Button (opens the quote form)", max: 33 },
    modelNumber: { kind: "text", label: "Row: model number (one model)", max: 18 },
    modelNumbers: { kind: "text", label: "Row: model numbers (several models)", max: 18 },
    noModel: { kind: "text", label: "Row: model number while there is none", max: 24 },
    category: { kind: "text", label: "Row: category", max: 18 },
    purification: { kind: "text", label: "Row: purification", max: 18 },
    water: { kind: "text", label: "Row: water", max: 18 },
    installation: { kind: "text", label: "Row: installation", max: 18 },
    warranty: { kind: "text", label: "Row: warranty", max: 18 },
  },
  defaults: {
    eyebrow: "Specifications",
    title: "The {name}, *in detail*",
    text: "Full technical specifications are available on request.",
    button: "Request full specifications",
    modelNumber: "Model number",
    modelNumbers: "Model numbers",
    noModel: "Available on request",
    category: "Category",
    purification: "Purification",
    water: "Water",
    installation: "Installation",
    warranty: "Warranty",
  },
});

/** The deep blue filtration band: its heading for the product's purification and the UF / RO guide cards. */
export const productFiltration = defineBlock({
  key: "product.filtration",
  label: "Filtration",
  description:
    "The deep blue band about the product’s purification and its two UF / RO cards. The text under the heading is the product’s filtration note in Products.",
  fields: {
    pill: { kind: "text", label: "Tag above the heading", max: 20 },
    titleSeveral: { kind: "text", label: "Heading (product with UF and RO options)", max: 40, marks: "one" },
    titleOne: {
      kind: "text",
      label: "Heading (product with one purification)",
      max: 45,
      marks: "one",
      tokens: ["{filtration}"],
      hint: "{filtration} is UF or RO.",
    },
    titleNone: { kind: "text", label: "Heading (product without UF or RO)", max: 35, marks: "one" },
    button: { kind: "text", label: "Button (opens Find my solution)", max: 17 },
    buttonNote: { kind: "text", label: "Line beside the button", max: 58 },
    guide: {
      kind: "cards",
      label: "UF and RO cards",
      count: [2, 2],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["UF card", "RO card"],
      hint: "The big UF and RO letters stay. The “best for” line is set in bold and followed by a full stop.",
      item: {
        name: { kind: "text", label: "Name", max: 20 },
        fit: { kind: "text", label: "Best for", max: 35 },
        body: { kind: "text", label: "Text", max: 128 },
      },
    },
    onModelCode: {
      kind: "text",
      label: "Card tag: this product’s model",
      max: 20,
      tokens: ["{code}"],
      hint: "On the card of a purification this product has. {code} is its model number.",
    },
    onModel: { kind: "text", label: "Card tag: this product (no model number)", max: 20 },
    otherModels: { kind: "text", label: "Card tag: a purification this product doesn’t have", max: 27 },
  },
  defaults: {
    pill: "Filtration",
    titleSeveral: "UF or RO, *matched to your water*",
    titleOne: "{filtration} purification, *built in*",
    titleNone: "Water from a *bottled supply*",
    button: "Check my water",
    buttonNote: "Three quick questions. We’ll recommend UF or RO.",
    guide: [
      {
        name: "Ultrafiltration",
        fit: "For treated city water",
        body: "A fine membrane removes particles, sediment and microorganisms while keeping naturally occurring minerals.",
      },
      {
        name: "Reverse osmosis",
        fit: "For well water and higher TDS",
        body: "A much finer membrane also reduces dissolved salts and other dissolved solids (TDS).",
      },
    ],
    onModelCode: "Model {code}",
    onModel: "On this model",
    otherModels: "Other LUSAKO purifiers",
  },
});

export const productWhoFor = defineBlock({
  key: "product.whoFor",
  label: "Who it’s for",
  description: "The heading over the “who it’s for” cards. The cards themselves are set in Products.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 34, marks: "one", tokens: ["{name}"], hint: `${nameHint} The blue part stays on one line too.` },
  },
  defaults: {
    eyebrow: "Who it’s for",
    title: "Where the {name} *fits best*",
  },
});

/** Installation, warranty and maintenance: the heading and the three cards' fixed wording. */
export const productCare = defineBlock({
  key: "product.care",
  label: "Installation, warranty and maintenance",
  description:
    "The heading and the three cards. Each product’s installation tag and note, and its warranty, are set in Products; so is a product’s own maintenance note.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 38, marks: "one" },
    description: { kind: "text", label: "Text beside the heading", max: 105 },
    installationTitle: { kind: "text", label: "Installation card: title", max: 20 },
    warrantyTitle: { kind: "text", label: "Warranty card: title", max: 20 },
    warrantyText: { kind: "text", label: "Warranty card: text", max: 171 },
    maintenanceTitle: { kind: "text", label: "Maintenance card: title", max: 20 },
    maintenancePill: { kind: "text", label: "Maintenance card: tag", max: 18 },
    maintenanceNote: {
      kind: "text",
      label: "Maintenance card: text",
      max: 311,
      hint: "Also the answer to “What maintenance does it need?”. A product with its own maintenance note in Products shows that instead.",
    },
    serviceLink: { kind: "text", label: "Maintenance card: link (opens Service & support)", max: 24 },
  },
  defaults: {
    eyebrow: "LUSAKO Care",
    title: "Set up, covered and *cared for*",
    description: "Our team sets it up, a product warranty covers it, and LUSAKO Care keeps it performing.",
    installationTitle: "Installation",
    warrantyTitle: "Warranty",
    warrantyText:
      "Every purchased LUSAKO system comes with a product warranty, plus access to LUSAKO after-sales service and Annual Maintenance Contracts (AMC).",
    maintenanceTitle: "Maintenance",
    maintenancePill: "LUSAKO Care",
    maintenanceNote,
    serviceLink: "Service & support",
  },
});

/**
 * The questions every product page asks and answers. The warranty question comes from FAQs, and a product's own
 * questions (Products) follow these.
 */
export const productFaqs = defineBlock({
  key: "product.faqs",
  label: "Questions",
  description:
    "The heading and the questions every product page answers, worked out from the product. The warranty question after them is in FAQs; a product’s own questions are added in Products.",
  fields: {
    title: { kind: "text", label: "Heading", max: 32, tokens: ["{name}"], hint: nameHint },
    filtrationSeveralQuestion: { kind: "text", label: "Purification question (product with UF and RO options)", max: 45 },
    filtrationSeveralAnswer: {
      kind: "text",
      label: "Its answer",
      max: 147,
      tokens: ["{note}"],
      hint: "{note} is the product’s filtration note from Products.",
    },
    filtrationOneQuestion: {
      kind: "text",
      label: "Purification question (product with one purification)",
      max: 44,
      tokens: ["{name}"],
      hint: "{name} is the product’s name.",
    },
    filtrationOneAnswer: {
      kind: "text",
      label: "Its answer",
      max: 102,
      tokens: ["{note}"],
      hint: "{note} is the product’s filtration note from Products.",
    },
    filtrationNoneQuestion: {
      kind: "text",
      label: "Purification question (product without UF or RO)",
      max: 35,
      tokens: ["{name}"],
      hint: "{name} is the product’s name. The answer is the product’s filtration note.",
    },
    rentalQuestion: { kind: "text", label: "Rental question", max: 48, tokens: ["{name}"], hint: "{name} is the product’s name." },
    rentalAnswer: {
      kind: "text",
      label: "Its answer",
      max: 399,
      tokens: ["{name}"],
      hint: "Used while the product’s rent price and the initial payment are hidden.",
    },
    rentalAnswerWithInitial: {
      kind: "text",
      label: "Its answer while only the initial payment is shown",
      max: 246,
      tokens: ["{name}", "{initial}"],
      hint: "Used while the product’s rent price is hidden. {initial} is the initial payment per unit, like “LKR 6,000”.",
    },
    rentalAnswerWithPrice: {
      kind: "text",
      label: "Its answer while the rent price is shown",
      max: 371,
      tokens: ["{name}", "{price}"],
      hint: "Used while the initial payment is hidden. {price} is the product’s lowest monthly rental, written like “LKR 4,990/month + VAT”.",
    },
    rentalAnswerWithPrices: {
      kind: "text",
      label: "Its answer while the rent price and the initial payment are shown",
      max: 321,
      tokens: ["{name}", "{price}", "{initial}"],
      hint: "{price} is the product’s lowest monthly rental, written like “LKR 4,990/month + VAT”, and {initial} the initial payment per unit.",
    },
    installationQuestion: {
      kind: "text",
      label: "Installation question",
      max: 38,
      hint: "Its answer is the product’s installation note from Products.",
    },
    maintenanceQuestion: {
      kind: "text",
      label: "Maintenance question",
      max: 36,
      hint: "Its answer is the maintenance note (Installation, warranty and maintenance, or the product’s own).",
    },
  },
  defaults: {
    title: "Questions about the {name}",
    filtrationSeveralQuestion: "Should I choose the UF or RO version?",
    filtrationSeveralAnswer:
      "{note} Not sure about your water? Find My Solution recommends the right version, or our team can check your water for you.",
    filtrationOneQuestion: "Which water is the {name} suited to?",
    filtrationOneAnswer: "{note} If your home or workplace uses well water, talk to our team before you choose.",
    filtrationNoneQuestion: "Does the {name} purify water?",
    rentalQuestion: "Can I rent the {name} instead of buying?",
    rentalAnswer:
      "Yes. The {name} is available to rent for one predictable monthly payment, plus a one-time initial payment per unit in the first month. Outside the Western Province the Regional Hydration Service is added as a separate line. Ask for a rental quote and we’ll confirm every amount. For most homes, buying is the better long-term value.",
    rentalAnswerWithInitial:
      "Rental of the {name} is available on request: ask our team and we’ll recommend a monthly plan. Every rental starts with a one-time initial payment of {initial} per unit, payable only in the first month.",
    rentalAnswerWithPrice:
      "Yes. The {name} is available to rent from {price}, plus a one-time initial payment per unit in the first month. Outside the Western Province the Regional Hydration Service is added as a separate line. Ask for a rental quote and we’ll confirm every amount. For most homes, buying is the better long-term value.",
    rentalAnswerWithPrices:
      "Yes. The {name} is available to rent from {price}, plus a one-time initial payment of {initial} per unit in the first month. Outside the Western Province the Regional Hydration Service is added as a separate line. For most homes, buying is the better long-term value.",
    installationQuestion: "What does installation involve?",
    maintenanceQuestion: "What maintenance does it need?",
  },
});

export const productOthers = defineBlock({
  key: "product.others",
  label: "Other purifiers",
  description: "The heading and button over the sliding row of the other purifiers at the foot of the page.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 29, marks: "one" },
    button: { kind: "text", label: "Button (opens Water purifiers)", max: 22 },
  },
  defaults: {
    eyebrow: "Explore the range",
    title: "Other LUSAKO *purifiers*",
    button: "View all purifiers",
  },
});

/** Each product's social sharing image (app/og/products/[slug]). */
export const productShareCard = defineBlock({
  key: "product.shareCard",
  label: "Social sharing image",
  description:
    "The line and footer on the image social networks show when a product page is shared. The name and tagline above them come from Products. Networks keep a shared image for a while, so a change can take days to show there.",
  fields: {
    text: {
      kind: "text",
      label: "Line under the name",
      max: 81,
      tokens: ["{purification}", "{temperatures}"],
      hint: "{purification} and {temperatures} are the product’s, from Products, like “UF / RO” and “Hot · Normal · Cold”.",
    },
    footer: {
      kind: "text",
      label: "Footer",
      max: 18,
      hint: "Set in capitals after the product’s category, like “COUNTERTOP • WATER PURIFIERS”.",
    },
  },
  defaults: {
    text: "{purification} · {temperatures} · Installed and cared for by LUSAKO",
    footer: "WATER PURIFIERS",
  },
});

/** Product pages: its editable text, in the order the page shows it. */
export const blocks: AnyBlock[] = [
  productHero,
  productFacts,
  productOptions,
  productFeatures,
  productSpecs,
  productFiltration,
  productWhoFor,
  productCare,
  productFaqs,
  productOthers,
  productShareCard,
];
