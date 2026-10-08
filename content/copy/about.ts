import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** About LUSAKO: its editable text. Every block's defaults are the page's wording as designed. */

export const aboutSeo = seoBlock("about", {
  title: "About LUSAKO – Water Purification in Sri Lanka",
  description:
    "LUSAKO is a Sri Lankan water purification and hydration company: water purifiers to buy, hydration solutions to rent, and LUSAKO Care for service.",
});

/** The page's header: label, two-line headline and intro over the photo. */
export const aboutHero = defineBlock({
  key: "about.hero",
  label: "Hero",
  description: "The label, headline and line under it over the photo at the top of the page.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 24 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 20,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two lines, each rising in on its own. Wrap words in *asterisks* to set them in blue, like the whole second line today.",
    },
    description: { kind: "text", label: "Intro", max: 178 },
  },
  defaults: {
    eyebrow: "About LUSAKO",
    title: ["Better water.", "*Better way.*"],
    description:
      "From homes to offices and large organisations, LUSAKO provides the right purification technology, the right equipment and the right service for your water needs.",
  },
});

/** The statement beside the round photo, the paragraph under it and the three Buy / Rent / Care cards. */
export const aboutIntro = defineBlock({
  key: "about.intro",
  label: "Who we are",
  description:
    "The large statement beside the round photo, the paragraph under it and the three small cards. The line under the photo is LUSAKO’s name and descriptor, which stay as they are.",
  fields: {
    statement: {
      kind: "list",
      label: "Statement",
      count: [2, 2],
      max: 70,
      reorder: false,
      itemLabel: "Sentence",
      itemNames: ["First sentence", "Second sentence (in blue, on its own line)"],
      hint: "Set in large type, so keep each sentence short.",
    },
    description: { kind: "text", label: "Paragraph", max: 179 },
    promises: {
      kind: "cards",
      label: "Cards",
      count: [3, 3],
      itemLabel: "Card",
      item: {
        title: { kind: "text", label: "Title", max: 10, hint: "Set large in a narrow card, so keep it to one short word." },
        body: { kind: "text", label: "Text", max: 72 },
      },
    },
  },
  defaults: {
    statement: ["LUSAKO is a water purification and hydration solutions company.", "Not simply a seller of purifiers."],
    description:
      "We help homes, offices and organisations move beyond bottled-water deliveries to purified water on tap, and we look after it long after installation.",
    promises: [
      { title: "Buy", body: "Own your water purification system." },
      { title: "Rent", body: "Get complete hydration for one predictable monthly payment." },
      { title: "Care", body: "Professional installation, maintenance and technical support." },
    ],
  },
});

/**
 * "Brand architecture": the heading and the three division cards. The purifier families on the first card come from
 * Products and the rental plans on the second from Rental plans; each card keeps its colours and link.
 */
export const aboutArchitecture = defineBlock({
  key: "about.architecture",
  label: "Brand architecture",
  description:
    "The heading and the three division cards under the LUSAKO badge. The first card’s tags are the purifier families (from Products) and the second’s are the rental plans (from Rental plans); the third card’s tags are set here.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 42, marks: "one" },
    description: { kind: "text", label: "Text", max: 118 },
    divisions: {
      kind: "cards",
      label: "Divisions",
      count: [3, 3],
      reorder: false,
      itemLabel: "Division",
      itemNames: ["Direct sales (opens Water purifiers)", "Rental (opens Rental)", "Service (opens Service & support)"],
      item: {
        label: { kind: "text", label: "Small label", max: 16, hint: "Set in small capitals above the name." },
        brand: { kind: "text", label: "Name", max: 32 },
        summary: { kind: "text", label: "Text", max: 113 },
        link: { kind: "text", label: "Link text", max: 22 },
      },
    },
    journeyLabel: { kind: "text", label: "Label above each journey", max: 16 },
    salesJourney: {
      kind: "list",
      label: "Direct sales: journey",
      count: [2, 4],
      max: 16,
      itemLabel: "Stage",
      hint: "Shown in a row with an arrow between each stage.",
    },
    rentalJourney: {
      kind: "list",
      label: "Rental: journey",
      count: [2, 4],
      max: 16,
      itemLabel: "Stage",
      hint: "Shown in a row with an arrow between each stage.",
    },
    serviceTags: { kind: "list", label: "Service: tags", count: [1, 10], max: 26, itemLabel: "Tag" },
  },
  defaults: {
    eyebrow: "Brand architecture",
    title: "Three business pillars, *one brand*",
    description: "Direct sales, rental and service, each with a clear journey. Together they make BUY | RENT | CARE.",
    divisions: [
      {
        label: "Direct sales",
        brand: "LUSAKO Water Purifiers",
        summary: "Purification systems you own, backed by warranty and LUSAKO after-sales service.",
        link: "Explore purifiers",
      },
      {
        label: "Rental",
        brand: "LUSAKO Hydration Solutions",
        summary: "Complete hydration for one predictable monthly payment, maintained by LUSAKO.",
        link: "Explore rental",
      },
      {
        label: "Service",
        brand: "LUSAKO Care",
        summary: "Professional installation, maintenance and technical support for purchased and rented systems.",
        link: "Service & support",
      },
    ],
    journeyLabel: "Journey",
    salesJourney: ["Buy", "Own", "Service"],
    rentalJourney: ["Rent", "Use", "We maintain"],
    serviceTags: ["Installation", "Preventive maintenance", "Filter replacement", "Technical service", "Water testing", "AMC plans", "Parts & accessories"],
  },
});

export const blocks: AnyBlock[] = [aboutSeo, aboutHero, aboutIntro, aboutArchitecture];
