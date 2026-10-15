import { partCategories } from "../parts";
import { defineBlock, seoBlock, type AnyBlock } from "./schema";
import { ctaBlock } from "./shared";

/** Filters, parts & accessories: its editable text. Every block's defaults are the page's wording as designed. */

export const partsSeo = seoBlock("parts", {
  title: "Water Filters, Parts & Accessories",
  description:
    "Genuine LUSAKO water filter cartridges with prices: sediment, carbon, UF, RO and mineral filters, plus purifier spare parts and accessories, fitted for you.",
});

export const partsHero = defineBlock({
  key: "parts.hero",
  label: "Hero",
  description: "The label, headline and intro over the parts photo, and the two buttons.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 24 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 24,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each on its own line. Wrap the words shown in blue in *asterisks*, like & *accessories*.",
    },
    description: { kind: "text", label: "Intro", max: 162, multiline: true },
    askButton: { kind: "text", label: "First button (opens the parts enquiry form)", max: 24 },
    whatsappButton: { kind: "text", label: "Second button (opens WhatsApp)", max: 20 },
    whatsappMessage: {
      kind: "text",
      label: "WhatsApp button: the message it starts",
      max: 80,
      hint: "Written into the visitor’s WhatsApp chat, ready to send.",
    },
  },
  defaults: {
    eyebrow: "Genuine LUSAKO parts",
    title: ["Filters, parts", "& *accessories*"],
    description:
      "Genuine filter cartridges, spare parts and accessories that keep your purifier performing, fitted by LUSAKO technicians if you need us.",
    askButton: "Ask for a part",
    whatsappButton: "WhatsApp us",
    whatsappMessage: "Hi LUSAKO, I’m looking for a filter or spare part.",
  },
});

export const partsStrip = defineBlock({
  key: "parts.strip",
  label: "Strip under the hero",
  description: "The line that sums the page up and the sentence under it. The pills are the three groups’ short names.",
  fields: {
    title: { kind: "text", label: "Heading", max: 35 },
    description: { kind: "text", label: "Text", max: 97 },
  },
  defaults: {
    title: "The right part for your model",
    description: "Tell us your model and serial number and we’ll match the part, or fit it for you.",
  },
});

export const partsCategories = defineBlock({
  key: "parts.categories",
  label: "The three groups",
  description:
    "Filter cartridges, spare parts and accessories: the three cards under the hero and the heading of each group’s list. The groups, their order and icons are fixed; the parts in each are in Parts & accessories.",
  fields: {
    categories: {
      kind: "cards",
      label: "Groups",
      count: [partCategories.length, partCategories.length],
      reorder: false,
      itemLabel: "Group",
      itemNames: partCategories.map((category) => category.short),
      item: {
        title: { kind: "text", label: "Name", max: 32 },
        short: {
          kind: "text",
          label: "Short name",
          max: 20,
          hint: "Used in the pills, the label above the list, the “Ask about …” button and the line shown when the group has no parts.",
        },
        body: { kind: "text", label: "Description", max: 92 },
      },
    },
  },
  defaults: { categories: partCategories.map(({ title, short, body }) => ({ title, short, body })) },
});

export const partsList = defineBlock({
  key: "parts.list",
  label: "Part lists",
  description:
    "The wording around each group’s parts: the button, the price and filter-life lines, and the notes under the list. Prices and lives are set per part in Parts & accessories; the AMC discounts come from AMC plans.",
  fields: {
    askAbout: {
      kind: "text",
      label: "Button beside each group’s heading",
      max: 24,
      tokens: ["{category}"],
      hint: "{category} is the group’s short name in lower case.",
    },
    noPrice: { kind: "text", label: "Shown instead of a price", max: 18, hint: "For parts without a price." },
    life: {
      kind: "text",
      label: "A filter’s typical life",
      max: 41,
      tokens: ["{months}"],
      hint: "{months} is the part’s typical life, set in Parts & accessories.",
    },
    empty: {
      kind: "text",
      label: "When a group has no parts",
      max: 66,
      tokens: ["{category}"],
      hint: "{category} is the group’s short name in lower case.",
    },
    enquiry: {
      kind: "text",
      label: "Enquiry message",
      max: 40,
      tokens: ["{part}"],
      hint: "Written into the contact form’s message when someone clicks a part. {part} is the part’s name.",
    },
    pricesNote: { kind: "text", label: "Note: prices", max: 53, hint: "Shown under a list that has prices." },
    lifeNote: { kind: "text", label: "Note: filter life", max: 94, hint: "Shown under a list that has typical lives." },
    filterDiscount: {
      kind: "text",
      label: "Note: AMC discount on filters",
      max: 66,
      tokens: ["{percent}"],
      hint: "{percent} is the highest filter discount in AMC plans. Hidden when no plan has one.",
    },
    partsDiscount: {
      kind: "text",
      label: "Note: AMC discount on spare parts",
      max: 72,
      tokens: ["{percent}"],
      hint: "{percent} is the highest spare-parts discount in AMC plans. Hidden when no plan has one.",
    },
    amcLink: { kind: "text", label: "Link after a discount note (opens AMC plans)", max: 20 },
  },
  defaults: {
    askAbout: "Ask about {category}",
    noPrice: "Ask for a price",
    life: "Typical life about {months} months",
    empty: "Ask our team for the {category} that fit your purifier.",
    enquiry: "I’d like a price for: {part}.",
    pricesNote: "Standard prices, excluding applicable taxes.",
    lifeNote: "Replacement intervals vary with water quality, usage and operating conditions.",
    filterDiscount: "AMC customers save up to {percent}% on eligible filters.",
    partsDiscount: "AMC customers save up to {percent}% on eligible spare parts.",
    amcLink: "See AMC plans",
  },
});

export const partsHelp = defineBlock({
  key: "parts.help",
  label: "Not sure which part?",
  description: "The panel after the part lists, with its button to the parts enquiry form.",
  fields: {
    title: { kind: "text", label: "Heading", max: 35 },
    body: { kind: "text", label: "Text", max: 160, multiline: true },
    button: { kind: "text", label: "Button (opens the parts enquiry form)", max: 24 },
  },
  defaults: {
    title: "Not sure which part you need?",
    body: "Send us the model and serial number from your purifier. Our technicians will identify the right part, and fit it for you if you like.",
    button: "Ask for a part",
  },
});

export const partsCta = ctaBlock("parts.ctaBand", "Closing call to action", {
  eyebrow: "LUSAKO Care",
  title: ["Filters due for a change?", "Let us take care of it."],
  description: "An AMC plans filter changes and maintenance for the year ahead, so your purifier keeps performing.",
  button: "See AMC plans",
});

export const blocks: AnyBlock[] = [partsSeo, partsHero, partsStrip, partsCategories, partsList, partsHelp, partsCta];
