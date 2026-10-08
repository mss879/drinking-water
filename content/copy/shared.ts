import { functionalWaters } from "../functional-water";
import { howItWorks, rentalInclusions, services } from "../services";
import { defineBlock, type AnyBlock } from "./schema";

/** Shared sections: their editable text. Every block's defaults are the wording as designed. */

const ctaFields = {
  eyebrow: { kind: "text", label: "Label above the heading", max: 40 },
  title: {
    kind: "list",
    label: "Heading",
    count: [2, 2],
    max: 40,
    itemLabel: "Line",
    hint: "Two lines; on tablets and computers the second starts on a new line.",
  },
  description: { kind: "text", label: "Text", max: 260, multiline: true },
  button: { kind: "text", label: "Button", max: 28 },
} as const;

export type CtaCopy = { eyebrow: string; title: string[]; description: string; button: string };

/** A closing call-to-action band (components/sections/cta-band.tsx). The button's destination stays in the code. */
export function ctaBlock(key: string, label: string, defaults: CtaCopy) {
  return defineBlock({
    key,
    label,
    description: "The blue band at the bottom of the page, just above the footer.",
    fields: ctaFields,
    defaults,
  });
}

export const sharedCta = ctaBlock("shared.ctaBand", "Closing call to action (most pages)", {
  eyebrow: "Find my solution",
  title: ["Need help choosing?", "We’ll recommend the right system."],
  description: "Tell us your location, water source, customer type and preferred solution. LUSAKO recommends the appropriate system.",
  button: "Find my solution",
});

/** The LUSAKO Care services (Service & support, Hydration solutions). Icons and links stay with their place. */
export const sharedServices = defineBlock({
  key: "shared.services",
  label: "LUSAKO Care services",
  description: "The nine services listed on Service & support and Hydration solutions. Each keeps its icon and link.",
  fields: {
    services: {
      kind: "cards",
      label: "Services",
      count: [services.length, services.length],
      reorder: false,
      itemLabel: "Service",
      itemNames: services.map((service) => service.title),
      item: {
        title: { kind: "text", label: "Name", max: 40 },
        body: { kind: "text", label: "Description", max: 140 },
      },
    },
  },
  defaults: { services: services.map(({ title, body }) => ({ title, body })) },
});

/** "How it works" (home, Rental): its heading, the Buying / Renting switch and the steps for each. */
export const sharedHowItWorks = defineBlock({
  key: "shared.howItWorks",
  label: "How it works",
  description: "The heading, the Buying / Renting switch and the steps shown for each. The number of steps is fixed by the design.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 32 },
    title: { kind: "text", label: "Heading", max: 52, marks: "one" },
    buyTab: { kind: "text", label: "Switch: buying", max: 12 },
    rentTab: { kind: "text", label: "Switch: renting", max: 12 },
    buy: {
      kind: "cards",
      label: "Buying",
      count: [howItWorks.buy.length, howItWorks.buy.length],
      itemLabel: "Step",
      item: { title: { kind: "text", label: "Step", max: 24 }, body: { kind: "text", label: "Text", max: 120 } },
    },
    rent: {
      kind: "cards",
      label: "Renting",
      count: [howItWorks.rent.length, howItWorks.rent.length],
      itemLabel: "Step",
      item: { title: { kind: "text", label: "Step", max: 24 }, body: { kind: "text", label: "Text", max: 120 } },
    },
  },
  defaults: {
    eyebrow: "How it works",
    title: "From first question to *pure water* on tap",
    buyTab: "Buying",
    rentTab: "Renting",
    buy: howItWorks.buy.map((step) => ({ ...step })),
    rent: howItWorks.rent.map((step) => ({ ...step })),
  },
});

/** The functional water types (Functional water page, the home section). Their anchors and icons stay in place. */
export const sharedFunctionalWater = defineBlock({
  key: "shared.functionalWater",
  label: "Functional water types",
  description: "Sparkling, hydrogen, alkaline and other functional water: each one’s name, lines and three points.",
  fields: {
    types: {
      kind: "cards",
      label: "Types",
      count: [functionalWaters.length, functionalWaters.length],
      reorder: false,
      itemLabel: "Type",
      itemNames: functionalWaters.map((water) => water.name),
      item: {
        name: { kind: "text", label: "Name", max: 32 },
        short: { kind: "text", label: "Short line", max: 70 },
        body: { kind: "text", label: "Description", max: 220 },
        point1: { kind: "text", label: "Point 1", max: 60 },
        point2: { kind: "text", label: "Point 2", max: 60 },
        point3: { kind: "text", label: "Point 3", max: 60 },
      },
    },
  },
  defaults: {
    types: functionalWaters.map(({ name, short, body, points }) => ({ name, short, body, point1: points[0], point2: points[1], point3: points[2] })),
  },
});

/** "One monthly payment. Complete water care." and the six rental inclusions (home, Rental). Icons follow position. */
export const sharedRentalInclusions = defineBlock({
  key: "shared.rentalInclusions",
  label: "Rental inclusions",
  description: "“One monthly payment. Complete water care.” and the six things a rental includes (home and Rental). Each keeps its 3D icon.",
  fields: {
    title: {
      kind: "list",
      label: "Heading",
      count: [2, 2],
      max: 22,
      itemLabel: "Line",
      hint: "Two short lines that each stay on one line. The second is set in blue.",
    },
    intro: { kind: "text", label: "Text", max: 165 },
    button: { kind: "text", label: "Button (home page only, opens Rental)", max: 28 },
    items: {
      kind: "cards",
      label: "Inclusions",
      count: [rentalInclusions.length, rentalInclusions.length],
      reorder: false,
      itemLabel: "Inclusion",
      itemNames: rentalInclusions.map((item) => item.title),
      item: {
        lead: { kind: "text", label: "Heading", max: 34 },
        title: { kind: "text", label: "Bold words", max: 28, hint: "Shown in bold before the text, with a full stop after them." },
        body: { kind: "text", label: "Text", max: 100 },
      },
    },
  },
  defaults: {
    title: ["One monthly payment.", "Complete water care."],
    intro:
      "Rental is a service, not just a machine lease: equipment, installation, preventive maintenance and support according to your agreed plan.",
    button: "Explore rental",
    items: rentalInclusions.map(({ lead, title, body }) => ({ lead, title, body })),
  },
});

/** The UF or RO chooser (home, Rental). The cards' letters, links and the Rental plan names stay with their place. */
export const sharedPurificationChooser = defineBlock({
  key: "shared.purificationChooser",
  label: "UF or RO chooser",
  description:
    "“Which purification system is right for you?”, the UF and RO cards and the “Not sure about your water?” strip (home and Rental). On Rental the cards show the plan names and lines from Rental plans.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 32 },
    title: { kind: "text", label: "Heading", max: 56, marks: "one" },
    description: { kind: "text", label: "Text", max: 130 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [2, 2],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["UF (city water)", "RO (well water)"],
      item: {
        source: { kind: "text", label: "Water source tag", max: 28, hint: "The arrow and the letters (→ UF) are added after it." },
        name: { kind: "text", label: "Heading on the home page", max: 20, hint: "On Rental the card shows the plan name instead." },
        button: { kind: "text", label: "Button on the home page (opens UF or RO on Water purifiers)", max: 24 },
      },
    },
    quoteButton: { kind: "text", label: "Button on Rental (opens the quote form)", max: 24 },
    priceLabel: {
      kind: "text",
      label: "Line above the monthly price on Rental",
      max: 20,
      hint: "Shown only when the plan’s price is switched on in Prices & quotes.",
    },
    stripTitle: { kind: "text", label: "“Not sure” strip: heading", max: 32 },
    stripText: { kind: "text", label: "“Not sure” strip: text", max: 70 },
    stripButton: { kind: "text", label: "“Not sure” strip: button (opens Find my solution)", max: 28 },
  },
  defaults: {
    eyebrow: "Choose your purification",
    title: "Which purification system is *right for you?*",
    description: "You don’t need to be a water expert. Tell us where your water comes from and we match the right technology.",
    cards: [
      { source: "City water", name: "Ultrafiltration", button: "Explore UF" },
      { source: "Well water / higher TDS", name: "Reverse osmosis", button: "Explore RO" },
    ],
    quoteButton: "Get a quote",
    priceLabel: "Rental from",
    stripTitle: "Not sure about your water?",
    stripText: "Answer three quick questions and we’ll recommend UF or RO.",
    stripButton: "Check my water",
  },
});

/** "Should you buy or rent?" (home, Water purifiers, Rental): one source for the table and the phone cards. */
export const sharedBuyVsRent = defineBlock({
  key: "shared.buyVsRent",
  label: "Buy or rent comparison",
  description:
    "“Should you buy or rent?”: the comparison table (cards on phones) and the prompt under it (home, Water purifiers and Rental).",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 32 },
    title: { kind: "text", label: "Heading", max: 32, marks: "one" },
    description: { kind: "text", label: "Text", max: 110 },
    compareLabel: { kind: "text", label: "Label over the row names", max: 16, hint: "Shown on tablets and computers." },
    buyTitle: { kind: "text", label: "Buy column: heading", max: 12 },
    buySubtitle: { kind: "text", label: "Buy column: line under the heading", max: 32 },
    buyButton: { kind: "text", label: "Buy column: button (opens Water purifiers)", max: 24 },
    rentTitle: { kind: "text", label: "Rent column: heading", max: 12 },
    rentSubtitle: { kind: "text", label: "Rent column: line under the heading", max: 32 },
    rentTag: { kind: "text", label: "Rent column: tag", max: 24, hint: "Shown on tablets and computers." },
    rentButton: { kind: "text", label: "Rent column: button (opens Rental)", max: 24 },
    rows: {
      kind: "cards",
      label: "Rows",
      count: [4, 10],
      itemLabel: "Row",
      item: {
        label: { kind: "text", label: "What is compared", max: 28 },
        buy: { kind: "text", label: "Buy", max: 46 },
        rent: { kind: "text", label: "Rent", max: 46 },
      },
    },
    closing: { kind: "text", label: "Question under the table", max: 40 },
    closingButton: { kind: "text", label: "Button under the table (opens Find my solution)", max: 28 },
  },
  defaults: {
    eyebrow: "Buy or rent?",
    title: "Should you *buy or rent?*",
    description: "Both give you better water. The difference is how you pay, and who looks after the system.",
    compareLabel: "Compare",
    buyTitle: "Buy",
    buySubtitle: "Own your system",
    buyButton: "Explore purifiers",
    rentTitle: "Rent",
    rentSubtitle: "From a monthly payment",
    rentTag: "Popular for offices",
    rentButton: "Explore rental",
    rows: [
      { label: "Ownership", buy: "You own the system", rent: "LUSAKO rental" },
      { label: "Upfront investment", buy: "Higher", rent: "Low" },
      { label: "Monthly payment", buy: "No", rent: "Yes" },
      { label: "Installation", buy: "Available", rent: "Included according to plan" },
      { label: "Preventive maintenance", buy: "Service plan available", rent: "Included according to agreement" },
      { label: "Filter replacement", buy: "Customer responsibility / service plan", rent: "Included according to agreement" },
      { label: "Best for", buy: "Long-term ownership", rent: "Hassle-free hydration" },
      { label: "Upgrade", buy: "Customer decision", rent: "Available at renewal, subject to plan" },
    ],
    closing: "Not sure which is right for you?",
    closingButton: "Help me choose",
  },
});

/** The dark questions block (components/sections/faq-section.tsx). A page's own heading still wins. */
export const sharedFaqBlock = defineBlock({
  key: "shared.faqBlock",
  label: "Questions block",
  description:
    "The dark questions block on most pages: its heading, the contact line and the button. The questions themselves are in FAQs.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 32,
      hint: "Water purifiers, Rental, Corporate hydration, Service & support, AMC plans and the product pages set their own heading.",
    },
    prompt: {
      kind: "text",
      label: "Contact line",
      max: 52,
      marks: "one",
      hint: "The words in *asterisks* link to the Contact page.",
    },
    button: { kind: "text", label: "Button (opens the FAQs page)", max: 28 },
  },
  defaults: {
    eyebrow: "FAQs",
    title: "Questions, answered",
    prompt: "Can’t find your answer? *Talk to our team*.",
    button: "See all FAQs",
  },
});

/** The three photo cards for homes, offices and companies (Hydration solutions, About). Links and photos stay. */
export const sharedSolutionsTrio = defineBlock({
  key: "shared.solutionsTrio",
  label: "Hydration solutions cards",
  description:
    "The three photo cards for homes, offices and companies (Hydration solutions and About). The heading above them shows on About only; the photos are in Website images.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 32 },
    title: { kind: "text", label: "Heading", max: 44, marks: "one" },
    description: { kind: "text", label: "Text", max: 125 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [3, 3],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["Homes (opens Water purifiers)", "Offices (opens Rental)", "Companies (opens Corporate hydration)"],
      item: {
        label: { kind: "text", label: "Tag on the photo", max: 20 },
        title: { kind: "text", label: "Heading", max: 36 },
        body: { kind: "text", label: "Text", max: 85 },
        button: { kind: "text", label: "Link text", max: 24 },
      },
    },
  },
  defaults: {
    eyebrow: "LUSAKO Hydration Solutions",
    title: "The right solution for *every space*",
    description: "Buy for your home, rent for your office, or let us manage hydration across your whole organisation.",
    cards: [
      { label: "For homes", title: "Buy a LUSAKO purifier", body: "Recommended option for domestic customers.", button: "Explore products" },
      {
        label: "For offices",
        title: "Rent a LUSAKO purifier",
        body: "Low upfront investment. Professional installation and ongoing service.",
        button: "Explore rental",
      },
      {
        label: "For companies",
        title: "Corporate Hydration Solutions",
        body: "One partner for your organisation’s drinking-water requirements.",
        button: "Talk to our team",
      },
    ],
  },
});

/** In the order the home page shows them, then the sections only other pages have; the closing band last. */
export const blocks: AnyBlock[] = [
  sharedRentalInclusions,
  sharedPurificationChooser,
  sharedFunctionalWater,
  sharedBuyVsRent,
  sharedHowItWorks,
  sharedFaqBlock,
  sharedSolutionsTrio,
  sharedServices,
  sharedCta,
];
