import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Home: its editable text. Every block's defaults are the page's wording as designed. */

export const homeSeo = seoBlock("home", {
  title: "Drinking Water Purifiers in Sri Lanka – Buy or Rent | LUSAKO",
  description:
    "Clean drinking water without the bottles: buy or rent a UF or RO water purifier for your home or office in Sri Lanka, installed and cared for by LUSAKO.",
});

export const homeHero = defineBlock({
  key: "home.hero",
  label: "Hero",
  description: "The headline over the video, the line under it and the two buttons.",
  fields: {
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 22,
      itemLabel: "Line",
      hint: "Two short lines that each stay on one line. The first is set in the blue gradient.",
    },
    intro: {
      kind: "text",
      label: "Intro",
      max: 120,
      marks: "optional",
      hint: "Wrap one word in *asterisks* to set it in bold white, like *Bottleless*.",
    },
    buyButton: { kind: "text", label: "First button (opens Water purifiers)", max: 28 },
    rentButton: { kind: "text", label: "Second button (opens Rental)", max: 28 },
  },
  defaults: {
    title: ["Pure water", "without the hassle"],
    intro: "*Bottleless* water purification and hydration solutions for homes, offices and businesses.",
    buyButton: "Buy a water purifier",
    rentButton: "Rent for your office",
  },
});

/** The strip under the hero film: four hassles, each beside its icon (the icons stay with their place). */
export const homeProblems = defineBlock({
  key: "home.problems",
  label: "Hassles strip",
  description: "The four hassles under the hero film. Each keeps its icon, so they can’t be reordered.",
  fields: {
    items: {
      kind: "list",
      label: "Hassles",
      count: [4, 4],
      max: 40,
      reorder: false,
      itemLabel: "Hassle",
      itemNames: ["Hassle 1 (delivery truck icon)", "Hassle 2 (crossed-out bottle icon)", "Hassle 3 (storeroom icon)", "Hassle 4 (spanner icon)"],
    },
  },
  defaults: {
    items: ["No more bottled-water deliveries.", "No heavy bottles.", "No unnecessary storage.", "No maintenance headaches."],
  },
});

/** "More than a purifier": the heading, the brand card on the water band and the three promises beside it. */
export const homePromise = defineBlock({
  key: "home.promise",
  label: "More than a purifier",
  description: "The heading over the blue water band, the text on its LUSAKO card and the three promises set large beside it.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 85, marks: "one" },
    description: { kind: "text", label: "Text beside the heading", max: 160 },
    brandText: {
      kind: "text",
      label: "LUSAKO card: text",
      max: 116,
      hint: "The line under “Better Water. Better Way.” on the dark card. The name and tagline stay as they are.",
    },
    promises: {
      kind: "cards",
      label: "Promises",
      count: [3, 3],
      itemLabel: "Promise",
      hint: "Each big word is set very large on one line, so keep it to one or two short words.",
      item: {
        title: { kind: "text", label: "Big word", max: 10 },
        caption: { kind: "text", label: "Line under it", max: 55 },
      },
    },
  },
  defaults: {
    eyebrow: "More than a purifier",
    title: "The right purification, professional installation and *long-term care*.",
    description:
      "Every LUSAKO system comes with the right purification for your water, a professional installation and care for as long as you have it.",
    brandText: "Water purification and hydration solutions for homes, offices and organisations across Sri Lanka.",
    promises: [
      { title: "UF or RO", caption: "Purification matched to your water source." },
      { title: "Installed", caption: "Professionally, by trained LUSAKO technicians." },
      { title: "Cared for", caption: "Preventive maintenance and technical support." },
    ],
  },
});

/** "Choose your way": the heading, the Buy, Rent, Care and Corporate cards and the round Find my solution link. */
export const homeChooseYourWay = defineBlock({
  key: "home.chooseYourWay",
  label: "Choose your way",
  description:
    "The Buy, Rent, Care and Corporate cards and the turning “Find my solution” circle. Where each card leads stays as it is.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 46,
      marks: "one",
      hint: "The words before and after the blue part each stay together on one line.",
    },
    buyTitle: { kind: "text", label: "Buy card: title", max: 10 },
    buyLine: { kind: "text", label: "Buy card: line", max: 42 },
    buyText: { kind: "text", label: "Buy card: text", max: 106 },
    buyLink: { kind: "text", label: "Buy card: link (opens Water purifiers)", max: 22 },
    rentTitle: { kind: "text", label: "Rent card: title", max: 10 },
    rentLine: { kind: "text", label: "Rent card: line", max: 66 },
    rentPill: { kind: "text", label: "Rent card: white tag", max: 34 },
    rentLink: { kind: "text", label: "Rent card: button (opens Rental)", max: 18 },
    careTitle: { kind: "text", label: "Care card: title", max: 10 },
    careLine: { kind: "text", label: "Care card: line", max: 73 },
    careNote: { kind: "text", label: "Care card: small print", max: 35 },
    careLink: { kind: "text", label: "Care card: link (opens Service & support)", max: 22 },
    corporateTitle: { kind: "text", label: "Corporate card: title", max: 10 },
    corporateLine: { kind: "text", label: "Corporate card: line", max: 79 },
    corporateNote: { kind: "text", label: "Corporate card: small print", max: 35 },
    corporateLink: { kind: "text", label: "Corporate card: link (opens Corporate hydration)", max: 22 },
    ring: {
      kind: "text",
      label: "Circle: the words round the ring (opens Find my solution)",
      max: 17,
      hint: "Written twice round the circle in capitals, so keep it about as long as “Find my solution”: longer words run out of ring.",
    },
  },
  defaults: {
    eyebrow: "Choose your way",
    title: "Buy it. Rent it. *We take care of it.*",
    buyTitle: "Buy",
    buyLine: "Own your water purification system.",
    buyText: "Invest once in a LUSAKO purification system and enjoy reliable purified water for years.",
    buyLink: "Explore purifiers",
    rentTitle: "Rent",
    rentLine: "Complete hydration for one predictable monthly payment.",
    rentPill: "Equipment and service included",
    rentLink: "Explore rental",
    careTitle: "Care",
    careLine: "Professional installation, maintenance and technical support.",
    careNote: "LUSAKO Care",
    careLink: "Service & support",
    corporateTitle: "Corporate",
    corporateLine: "One partner for your workplace hydration, across one site or many.",
    corporateNote: "Corporate Hydration Solutions",
    corporateLink: "Talk to our team",
    ring: "Find my solution",
  },
});

/** PURE ∞ HYDRATION: the two giant words either side of the water ribbon. */
export const homeBigType = defineBlock({
  key: "home.bigType",
  label: "Big words",
  description: "The two giant words either side of the water ribbon, set in capitals and sized to fill the row.",
  fields: {
    left: {
      kind: "text",
      label: "Outlined word (left)",
      max: 6,
      hint: "The two words share one row on computers: keep them to about 13 letters together.",
    },
    right: { kind: "text", label: "Blue word (right)", max: 10 },
    label: {
      kind: "text",
      label: "Name read out by screen readers",
      max: 40,
      hint: "Usually the two words as a phrase, like “Pure hydration”.",
    },
  },
  defaults: { left: "Pure", right: "Hydration", label: "Pure hydration" },
});

/** The functional water section's heading (the four water types are in Shared sections › Functional water types). */
export const homeFunctionalWater = defineBlock({
  key: "home.functionalWater",
  label: "Functional water",
  description: "The heading, text and button over the four functional water cards. The cards’ own wording is in Shared sections.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 50,
      marks: "one",
      hint: "The blue part stays together on one line.",
    },
    description: { kind: "text", label: "Text", max: 134 },
    button: { kind: "text", label: "Button (opens Functional water)", max: 29 },
  },
  defaults: {
    eyebrow: "Functional water",
    title: "More than pure. *Functional water on tap.*",
    description: "Sparkling, hydrogen and alkaline water from a LUSAKO system, purified first, then made just the way you like it.",
    button: "Explore functional water",
  },
});

/** The purifier carousel's heading (the purifiers themselves are in Products). */
export const homeFeatured = defineBlock({
  key: "home.featured",
  label: "Purifier carousel",
  description: "The heading and button over the sliding row of purifiers. The purifiers, and whether their prices show here, are set in Products and Prices & quotes.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 62, marks: "one" },
    button: { kind: "text", label: "Button (opens Water purifiers)", max: 22 },
  },
  defaults: {
    eyebrow: "Water purifiers",
    title: "Find the right system for your *water and lifestyle*",
    button: "View all purifiers",
  },
});

/** The blue band of phrases that scrolls past between the purifiers and Buy or rent. */
export const homeMarquee = defineBlock({
  key: "home.marquee",
  label: "Scrolling phrases",
  description: "The phrases that scroll across the blue band, in capitals, each followed by a water drop.",
  fields: {
    phrases: { kind: "list", label: "Phrases", count: [3, 10], max: 43, itemLabel: "Phrase" },
  },
  defaults: {
    phrases: [
      "Better water. Better way.",
      "Buy it. Rent it. We take care of it.",
      "Bottleless hydration",
      "UF & RO purification",
      "Professional installation",
      "Preventive maintenance",
    ],
  },
});

/** "Our clients": the heading and the ticked checklist (the sectors and their icons stay as they are). */
export const homeTrust = defineBlock({
  key: "home.trust",
  label: "Our clients",
  description:
    "The heading, text and button over the sectors LUSAKO serves, and the ticked list under them. Client logos are added in Client logos.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 49, marks: "one" },
    description: { kind: "text", label: "Text", max: 134 },
    button: { kind: "text", label: "Button (opens Our clients)", max: 26 },
    checklist: {
      kind: "list",
      label: "Ticked list",
      count: [3, 8],
      max: 30,
      itemLabel: "Point",
      hint: "Six fill the rows evenly: three across on computers, two on tablets.",
    },
  },
  defaults: {
    eyebrow: "Our clients",
    title: "Real installations. *Real relationships.*",
    description: "LUSAKO looks after drinking water for homes, offices and organisations. These are the places we serve every day.",
    button: "Client success stories",
    checklist: [
      "Warranty on purchases",
      "Professional installation",
      "Preventive maintenance",
      "Technical support",
      "Transparent rental terms",
      "Contactable local support",
    ],
  },
});

export const blocks: AnyBlock[] = [
  homeSeo,
  homeHero,
  homeProblems,
  homePromise,
  homeChooseYourWay,
  homeBigType,
  homeFunctionalWater,
  homeFeatured,
  homeMarquee,
  homeTrust,
];
