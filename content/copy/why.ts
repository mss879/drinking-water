import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Why LUSAKO: its editable text. Every block's defaults are the page's wording as designed. */

export const whySeo = seoBlock("why", {
  title: "Why LUSAKO – Your Professional Hydration Partner",
  description:
    "A professional hydration partner, not a catalogue of imported appliances: the right purification technology, installation, maintenance and long-term care.",
});

/** The page's header: label, two-line headline, intro and its two buttons (their destinations stay in the code). */
export const whyHero = defineBlock({
  key: "why.hero",
  label: "Hero",
  description: "The label, headline, line under it and the two buttons over the photo at the top of the page.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 24 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 22,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two lines, each rising in on its own. Wrap words in *asterisks* to set them in blue, like the whole second line today.",
    },
    description: { kind: "text", label: "Intro", max: 175 },
    findButton: { kind: "text", label: "First button (opens Find my solution)", max: 20 },
    quoteButton: { kind: "text", label: "Second button (opens Contact)", max: 20 },
  },
  defaults: {
    eyebrow: "Why LUSAKO",
    title: ["A hydration partner,", "*not a catalogue*"],
    description:
      "LUSAKO is a water purification and hydration solutions company. We match the right technology to your water, install it properly and look after it for years.",
    findButton: "Find my solution",
    quoteButton: "Get a quote",
  },
});

/** "The complete proposition": the heading that stays beside the numbered list, and the list itself. */
export const whyProposition = defineBlock({
  key: "why.proposition",
  label: "The complete proposition",
  description: "The heading on the left and the numbered points beside it. The numbers (01, 02…) follow the order of the points.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 29 },
    title: {
      kind: "text",
      label: "Heading",
      max: 47,
      marks: "one",
      hint: "The blue part stays together on one line.",
    },
    description: { kind: "text", label: "Text", max: 141 },
    items: {
      kind: "cards",
      label: "Points",
      count: [3, 7],
      itemLabel: "Point",
      item: {
        title: { kind: "text", label: "Title", max: 40 },
        body: { kind: "text", label: "Text", max: 155 },
      },
    },
  },
  defaults: {
    eyebrow: "The complete proposition",
    title: "Not just a machine. *The whole result.*",
    description: "A purifier is only as good as the advice, installation and care behind it. LUSAKO takes responsibility for all of it.",
    items: [
      {
        title: "Suitable purification technology",
        body: "UF for treated city water, RO for well water and higher TDS. We recommend the right one, so you never have to work it out alone.",
      },
      {
        title: "Professional installation",
        body: "Trained LUSAKO technicians connect your system to your existing water supply and check everything before handing over.",
      },
      { title: "Preventive maintenance", body: "Scheduled service visits keep your system performing at its best, year after year." },
      { title: "Technical support", body: "Diagnosis and repair by technicians who know LUSAKO systems inside out." },
      {
        title: "Long-term customer care",
        body: "Service plans and Annual Maintenance Contracts for purchased systems, and dedicated support for rental customers.",
      },
    ],
  },
});

/** The deep-blue band: its tag, heading and text, and the four numbered cards (each keeps its link). */
export const whyPillars = defineBlock({
  key: "why.pillars",
  label: "Buy, rent, hydrate, care band",
  description: "The deep-blue band with the four numbered cards. Each card keeps its place and where its link leads.",
  fields: {
    tag: { kind: "text", label: "Tag above the heading", max: 33 },
    title: { kind: "text", label: "Heading", max: 30 },
    description: { kind: "text", label: "Text beside the heading", max: 120 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [4, 4],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["Buy (opens Water purifiers)", "Rent (opens Rental)", "Hydrate (opens Hydration solutions)", "Care (opens Service & support)"],
      item: {
        name: { kind: "text", label: "Title", max: 8, hint: "Set very large in a narrow card, so keep it to one short word." },
        line: { kind: "text", label: "Text", max: 90 },
        link: { kind: "text", label: "Link text", max: 23 },
      },
    },
  },
  defaults: {
    tag: "BUY • RENT • HYDRATE • CARE",
    title: "Better water. Better way.",
    description: "Four ways LUSAKO brings better water to homes, offices and organisations, all backed by LUSAKO Care.",
    cards: [
      { name: "Buy", line: "Own your water purification system.", link: "Explore purifiers" },
      { name: "Rent", line: "Complete hydration for one predictable monthly payment.", link: "Explore rental" },
      { name: "Hydrate", line: "Hydration solutions for offices and organisations, across one site or many.", link: "Hydration solutions" },
      { name: "Care", line: "Professional installation, maintenance and technical support.", link: "LUSAKO Care" },
    ],
  },
});

/** "What you can count on": the heading and the eight cards. Icons and links follow each card's place. */
export const whyTrust = defineBlock({
  key: "why.trust",
  label: "What you can count on",
  description:
    "The heading and the eight cards with icons. Each card keeps its icon and link. The client-approval note under them stays as written.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 28, marks: "one" },
    description: { kind: "text", label: "Text beside the heading", max: 113 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [8, 8],
      reorder: false,
      itemLabel: "Card",
      itemNames: [
        "Card 1 (shield icon, opens Water purifiers)",
        "Card 2 (spanner icon)",
        "Card 3 (calendar icon)",
        "Card 4 (headset icon, opens Service & support)",
        "Card 5 (receipt icon, opens Rental)",
        "Card 6 (flask icon, opens Find my solution)",
        "Card 7 (speech bubbles icon, opens FAQs)",
        "Card 8 (map pin icon, opens Contact)",
      ],
      item: {
        title: { kind: "text", label: "Title", max: 32 },
        body: { kind: "text", label: "Text", max: 150 },
      },
    },
    rentalTermsWithPrice: {
      kind: "text",
      label: "Card 5: text while the initial payment is shown",
      max: 140,
      tokens: ["{price}"],
      hint: "Replaces card 5’s text while the initial payment is switched on in Prices & quotes. {price} is the amount per unit.",
    },
  },
  defaults: {
    eyebrow: "Trust",
    title: "What you can *count on*",
    description: "The essentials every LUSAKO customer can rely on, from the first question to years of service.",
    cards: [
      { title: "Warranty information", body: "Every purchased system comes with a product warranty, shown on its product page." },
      { title: "Professional installation", body: "Connected to your existing water supply by trained LUSAKO technicians." },
      { title: "Preventive maintenance", body: "Scheduled visits keep every system performing as it should." },
      { title: "Technical support", body: "Help when you need it, by phone, WhatsApp or an online service request." },
      {
        title: "Transparent rental terms",
        body: "Monthly rental + VAT, a one-time initial payment per unit, and any regional charge on its own line, all set out in your quote.",
      },
      { title: "Clear UF/RO recommendation", body: "Answer three quick questions and we recommend UF or RO for your water." },
      { title: "Frequently asked questions", body: "Straight answers on UF and RO, buying, rental and service." },
      { title: "Contactable local support", body: "A local team you can call, message on WhatsApp or email." },
    ],
    rentalTermsWithPrice: "Monthly rental + VAT, a one-time {price} initial payment per unit, and any regional charge on its own line.",
  },
});

/** "Your next step": the heading and the four photo cards (their photos and links stay with their place). */
export const whyNextSteps = defineBlock({
  key: "why.nextSteps",
  label: "Your next step",
  description: "The heading and the four photo cards near the bottom of the page. Each card keeps its photo and where it leads.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "text",
      label: "Heading",
      max: 50,
      marks: "one",
      hint: "The blue part stays together on one line.",
    },
    description: { kind: "text", label: "Text", max: 152 },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [4, 4],
      reorder: false,
      itemLabel: "Card",
      itemNames: [
        "Homes (opens Water purifiers)",
        "Offices (opens Rental)",
        "Organisations (opens Corporate hydration)",
        "Existing customers (opens Service & support)",
      ],
      item: {
        audience: { kind: "text", label: "Tag on the photo", max: 22 },
        title: { kind: "text", label: "Title", max: 22 },
        body: { kind: "text", label: "Text", max: 80 },
        link: { kind: "text", label: "Link text", max: 34 },
      },
    },
  },
  defaults: {
    eyebrow: "Your next step",
    title: "One clear next action *for every visitor*",
    description:
      "Buying for a home, renting for an office, planning for an organisation or looking after a system you already have: start here.",
    cards: [
      { audience: "For homes", title: "Buy", body: "Own your water purification system.", link: "Explore purifiers" },
      { audience: "For offices", title: "Rent", body: "Complete hydration for one predictable monthly payment.", link: "Explore rental" },
      {
        audience: "For organisations",
        title: "Corporate solution",
        body: "One partner for your workplace hydration, across one site or many.",
        link: "Request a corporate solution",
      },
      { audience: "Existing customers", title: "Contact service", body: "Keep your LUSAKO system performing at its best.", link: "Contact service" },
    ],
  },
});

export const blocks: AnyBlock[] = [whySeo, whyHero, whyProposition, whyPillars, whyTrust, whyNextSteps];
