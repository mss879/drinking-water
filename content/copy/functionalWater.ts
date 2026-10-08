import { defineBlock, seoBlock, type AnyBlock } from "./schema";
import { ctaBlock } from "./shared";

/** Functional water: its editable text. Every block's defaults are the page's wording as designed. */

export const functionalWaterSeo = seoBlock("functionalWater", {
  title: "Functional Water Solutions",
  description:
    "Sparkling, hydrogen and alkaline water on tap from LUSAKO: purified first, then made the way you like it, for homes, offices and hospitality.",
});

export const functionalWaterHero = defineBlock({
  key: "functionalWater.hero",
  label: "Hero",
  description: "The label, headline and intro over the photo, and the two buttons.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 30 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 20,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each set on its own line. The words in *asterisks* are shown in blue, like *functional water*.",
    },
    description: { kind: "text", label: "Intro", max: 135, multiline: true },
    optionsButton: { kind: "text", label: "First button (jumps to the options)", max: 22 },
    askButton: { kind: "text", label: "Second button (opens the quote form)", max: 20 },
  },
  defaults: {
    eyebrow: "Functional water solutions",
    title: ["More than pure:", "*functional water*"],
    description: "Sparkling, hydrogen and alkaline water from a LUSAKO system. Purified first, then made just the way you like it.",
    optionsButton: "Explore the options",
    askButton: "Ask our team",
  },
});

export const functionalWaterStrip = defineBlock({
  key: "functionalWater.strip",
  label: "Strip under the hero",
  description: "The line that sums the page up, the sentence under it and the pills on the right.",
  fields: {
    title: { kind: "text", label: "Heading", max: 44 },
    description: { kind: "text", label: "Text", max: 80 },
    pills: { kind: "list", label: "Pills", count: [1, 5], max: 16, itemLabel: "Pill" },
  },
  defaults: {
    title: "Functional water, without the bottles",
    description: "Made fresh at the point of use, for homes, offices and hospitality.",
    pills: ["Sparkling", "Hydrogen", "Alkaline"],
  },
});

export const functionalWaterTypes = defineBlock({
  key: "functionalWater.types",
  label: "Type sections: label and buttons",
  description:
    "The label and buttons in each type’s section. Each type’s name, text and points are in Shared sections › Functional water types.",
  fields: {
    pill: {
      kind: "text",
      label: "Label above each heading",
      max: 30,
      tokens: ["{number}"],
      hint: "{number} is filled in with 01, 02, 03 and 04.",
    },
    askButton: {
      kind: "text",
      label: "Ask button (opens the quote form)",
      max: 28,
      tokens: ["{water}"],
      hint: "{water} is the type’s name in lower case, such as “sparkling water”.",
    },
    askOtherButton: { kind: "text", label: "Ask button on the last type (Other functional water)", max: 32 },
    productButton: {
      kind: "text",
      label: "Product button (opens the purifier’s page)",
      max: 24,
      tokens: ["{product}"],
      hint: "{product} is the linked purifier’s name. Only types with a purifier show it.",
    },
  },
  defaults: {
    pill: "{number} · Functional water",
    askButton: "Ask about {water}",
    askOtherButton: "Ask about functional water",
    productButton: "View {product}",
  },
});

export const functionalWaterCta = ctaBlock("functionalWater.ctaBand", "Closing call to action", {
  eyebrow: "Functional water",
  title: ["Which functional water", "suits your space?"],
  description: "Tell us who will drink it and where. LUSAKO recommends the right functional water solution and purification for your water.",
  button: "Ask our team",
});

export const blocks: AnyBlock[] = [functionalWaterSeo, functionalWaterHero, functionalWaterStrip, functionalWaterTypes, functionalWaterCta];
