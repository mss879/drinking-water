import { faqTopics } from "../faqs";
import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** FAQs page: its editable text. Every block's defaults are the page's wording as designed. */

export const faqSeo = seoBlock("faq", {
  title: "Water Purifier FAQs – UF vs RO, Rental & AMC",
  description:
    "Answers about LUSAKO water purifiers: UF vs RO, city and well water, buying or renting, rental charges, installation, service, warranty and AMC plans.",
});

export const faqHero = defineBlock({
  key: "faq.hero",
  label: "Hero",
  description: "The label, headline and intro over the water photo.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 24 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 24,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each on its own line. Wrap the words shown in blue in *asterisks*, like *answered*.",
    },
    description: { kind: "text", label: "Intro", max: 125 },
  },
  defaults: {
    eyebrow: "FAQs",
    title: ["Questions,", "*answered*"],
    description: "UF or RO, buying or renting, installation and service: straight answers to the questions we hear most.",
  },
});

/** The topics' names. Each topic keeps its questions and its place on the page (its id is the link to it). */
export const faqTopicsCopy = defineBlock({
  key: "faq.topics",
  label: "Topics",
  description:
    "Each topic’s name, in the row of buttons under the hero and over its questions. The questions themselves, and which topic each belongs to, are in FAQs.",
  fields: {
    topics: {
      kind: "list",
      label: "Topic names",
      count: [faqTopics.length, faqTopics.length],
      max: 28,
      reorder: false,
      itemLabel: "Topic",
      itemNames: ["Purification questions", "Buying questions", "Rental questions", "Installation & service questions", "AMC questions"],
    },
  },
  defaults: { topics: faqTopics.map((topic) => topic.label) },
});

/** The "Still have a question?" box at the end of the questions. */
export const faqHelp = defineBlock({
  key: "faq.help",
  label: "Still have a question?",
  description: "The box after the last topic. The opening hours and the WhatsApp number come from Contact & social.",
  fields: {
    title: { kind: "text", label: "Heading", max: 28 },
    text: {
      kind: "text",
      label: "Text",
      max: 50,
      tokens: ["{hours}"],
      hint: "{hours} is replaced with the opening hours from Contact & social.",
    },
    askButton: { kind: "text", label: "First button (opens Contact)", max: 20 },
    whatsappButton: { kind: "text", label: "Second button (opens WhatsApp)", max: 20 },
  },
  defaults: {
    title: "Still have a question?",
    text: "Our team is happy to help. {hours}.",
    askButton: "Ask our team",
    whatsappButton: "WhatsApp us",
  },
});

export const blocks: AnyBlock[] = [faqSeo, faqHero, faqTopicsCopy, faqHelp];
