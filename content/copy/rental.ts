import { rentalPlans } from "../pricing";
import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Rental: its editable text. Every block's defaults are the page's wording as designed. */

export const rentalSeo = seoBlock("rental", {
  title: "Water Purifier Rental for Offices in Sri Lanka",
  description:
    "Rent a LUSAKO water purifier for your office or company: one predictable monthly payment for the equipment and ongoing service. PureFlow UF and RO plans.",
});

/** The hero over the office photo and the strip under it. The buttons' destinations stay in the code. */
export const rentalHero = defineBlock({
  key: "rental.hero",
  label: "Hero",
  description: "The headline over the office photo, the line under it, the two buttons and the strip just below the photo.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 32 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 24,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each set on its own line. Wrap words in *asterisks* to set them in blue, like the second line.",
    },
    description: { kind: "text", label: "Intro", max: 170 },
    quoteButton: { kind: "text", label: "First button (opens the quote builder)", max: 26 },
    enquiryButton: { kind: "text", label: "Second button (opens the rental form)", max: 26 },
    stripTitle: { kind: "text", label: "Strip under the photo: heading", max: 40 },
    stripText: { kind: "text", label: "Strip under the photo: text", max: 80 },
    stripPills: { kind: "list", label: "Strip under the photo: tags", count: [1, 4], max: 16, itemLabel: "Tag" },
    stripPrice: {
      kind: "text",
      label: "Strip under the photo: price tag",
      max: 30,
      tokens: ["{price}"],
      hint: "Shown in a blue tag only while the PureFlow UF plan price is switched on in Prices & quotes. {price} is that price; “/month + VAT” follows it.",
    },
  },
  defaults: {
    eyebrow: "LUSAKO Hydration Solutions",
    title: ["Your water purifier.", "*Our responsibility.*"],
    description:
      "For one predictable monthly payment, LUSAKO provides the equipment and ongoing service required to keep your drinking-water system operating.",
    quoteButton: "Build my rental quote",
    enquiryButton: "Rent for your office",
    stripTitle: "Pure water. Zero ownership hassle.",
    stripText: "Equipment and ongoing service, for one predictable monthly payment.",
    stripPills: ["Offices", "Companies"],
    stripPrice: "PureFlow from {price}",
  },
});

const benefitNames = ["Convenience", "Predictability", "Low initial cost", "Maintenance", "Service", "No ownership headache"] as const;

/** "Why rent with LUSAKO": the heading beside the six benefits. Each benefit keeps its icon by position. */
export const rentalWhy = defineBlock({
  key: "rental.whyRent",
  label: "Why rent with LUSAKO",
  description: "The heading and the six benefit cards under the hero. Each card keeps its icon.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: {
      kind: "list",
      label: "Heading",
      count: [2, 2],
      max: 36,
      marks: "optional",
      itemLabel: "Line",
      hint: "The first line sits on its own line. Wrap words in *asterisks* to set them in blue, like the second line.",
    },
    description: { kind: "text", label: "Text", max: 143 },
    button: { kind: "text", label: "Button (opens the quote builder)", max: 26 },
    benefits: {
      kind: "cards",
      label: "Benefits",
      count: [6, 6],
      reorder: false,
      itemLabel: "Benefit",
      itemNames: benefitNames,
      hint: "Each card keeps its icon. Start a new line in a title to set it on two lines, like “Low Initial Cost.” and “Simple Monthly Rentals.”",
      item: {
        title: { kind: "text", label: "Title (a new line starts a second line)", max: 48, multiline: true },
        body: { kind: "text", label: "Text", max: 180 },
      },
    },
    initialWithPrice: {
      kind: "text",
      label: "Low initial cost: text while the initial payment is shown",
      max: 190,
      tokens: ["{price}"],
      hint: "Replaces the Low initial cost card’s text while the initial payment is switched on in Prices & quotes. {price} is the amount per unit.",
    },
  },
  defaults: {
    eyebrow: "Why rent with LUSAKO",
    title: ["Enjoy better water.", "*Leave the maintenance to us.*"],
    description: "You’re not simply renting equipment. LUSAKO provides an ongoing hydration solution, so your team just enjoys the water.",
    button: "How rental is charged",
    benefits: [
      { title: "Convenience", body: "Pure water on tap, with no bottle deliveries to arrange or store." },
      { title: "Predictability", body: "One predictable monthly payment that’s easy to budget for." },
      {
        title: "Low Initial Cost.\nSimple Monthly Rentals.",
        body: "Start with a low one-time initial payment, plus the monthly rental for the first month. From the second month onwards, pay only the monthly rental.",
      },
      { title: "Maintenance", body: "Scheduled preventive maintenance, according to your rental agreement." },
      { title: "Service", body: "Technical support from LUSAKO whenever your team needs it." },
      { title: "No ownership headache", body: "The equipment remains LUSAKO’s, and so does looking after it." },
    ],
    initialWithPrice:
      "Start with just {price} as a one-time initial payment, plus the monthly rental for the first month. From the second month onwards, pay only the monthly rental.",
  },
});

export const rentalPlansCopy = defineBlock({
  key: "rental.plans",
  label: "Rental plans",
  description:
    "The three rental plans’ names and lines, used on the Rental page, the UF / RO cards, the quote builder, Find my solution and About. Their prices are in Prices & quotes.",
  fields: {
    plans: {
      kind: "cards",
      label: "Plans",
      count: [3, 3],
      reorder: false,
      itemLabel: "Plan",
      itemNames: rentalPlans.map((plan) => plan.name),
      item: {
        name: { kind: "text", label: "Name", max: 24 },
        stages: { kind: "text", label: "Purification", max: 24 },
        bestFor: { kind: "text", label: "Best for", max: 40 },
        description: { kind: "text", label: "Description", max: 140 },
      },
    },
  },
  defaults: { plans: rentalPlans.map(({ name, stages, bestFor, description }) => ({ name, stages, bestFor, description })) },
});

/** The AquaSpark card under the UF / RO chooser. Its name, tags and description come from the rental plans. */
export const rentalAquaspark = defineBlock({
  key: "rental.aquaspark",
  label: "AquaSpark card",
  description: "The sparkling-water card under the UF / RO chooser. Its name, tags and description are in Rental plans.",
  fields: {
    rateLabel: { kind: "text", label: "Small label above the rental line", max: 16 },
    rate: { kind: "text", label: "Rental line", max: 22, hint: "Shown while the AquaSpark plan price is hidden." },
    rateWithPrice: {
      kind: "text",
      label: "Rental line while the price is shown",
      max: 20,
      tokens: ["{price}"],
      hint: "Shown while the AquaSpark plan price is switched on in Prices & quotes. {price} is that price; “/month + VAT” follows it.",
    },
    button: { kind: "text", label: "Button (opens the quote form)", max: 20 },
  },
  defaults: {
    rateLabel: "Rental",
    rate: "One monthly payment",
    rateWithPrice: "From {price}",
    button: "Get a quote",
  },
});

/** The heading over the quote builder. */
export const rentalQuote = defineBlock({
  key: "rental.quote",
  label: "Rental quote: heading",
  description: "The heading over the quote builder.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 20 },
    title: {
      kind: "text",
      label: "Heading",
      max: 28,
      marks: "one",
      hint: "Wrap one word or phrase in *asterisks* to set it in blue, like *clearly*.",
    },
    description: { kind: "text", label: "Text", max: 160 },
  },
  defaults: {
    eyebrow: "Rental quote",
    title: "Every charge, *clearly*",
    description:
      "Start with your province. We show every line your quote will carry, so you know what you pay in the first month and every month after.",
  },
});

/**
 * The quote builder (components/rental/rental-quote-builder.tsx). Provinces, customer types and the 1–50 units stay
 * in the code (they end up in inquiries and analytics), and so do its VAT statements.
 */
export const rentalQuoteBuilder = defineBlock({
  key: "rental.quoteBuilder",
  label: "Rental quote builder",
  description:
    "The four questions and the blue quote panel beside them. Amounts appear only for the prices switched on in Prices & quotes; the wording marked “while prices are shown” is used then.",
  fields: {
    provinceLabel: { kind: "text", label: "Question 1", max: 34 },
    provincePlaceholder: { kind: "text", label: "Question 1: text in the list before a province is picked", max: 26 },
    provinceHint: { kind: "text", label: "Question 1: hint", max: 118 },
    customerLabel: { kind: "text", label: "Question 2", max: 28 },
    customers: {
      kind: "list",
      label: "Question 2: answers",
      count: [3, 3],
      max: 10,
      reorder: false,
      itemLabel: "Answer",
      itemNames: ["Home", "Office", "Company"],
      hint: "Short words: on phones the three sit side by side.",
    },
    homeHint: { kind: "text", label: "Question 2: hint for Home", max: 68 },
    homeLink: { kind: "text", label: "Question 2: link for Home (opens Water purifiers)", max: 24 },
    officeHint: { kind: "text", label: "Question 2: hint for Office", max: 105 },
    companyHint: { kind: "text", label: "Question 2: hint for Company", max: 36 },
    companyLink: { kind: "text", label: "Question 2: link for Company (opens Corporate hydration)", max: 30 },
    purificationLabel: { kind: "text", label: "Question 3", max: 28 },
    planPrice: {
      kind: "text",
      label: "Question 3: price under a plan",
      max: 24,
      tokens: ["{price}"],
      hint: "Shown under PureFlow UF or RO only while that plan’s price is switched on. {price} is the price; “/month” follows it.",
    },
    purificationHint: { kind: "text", label: "Question 3: hint", max: 24 },
    purificationLink: { kind: "text", label: "Question 3: link (opens Find my solution)", max: 24 },
    unitsLabel: { kind: "text", label: "Question 4", max: 28 },
    unitsHint: { kind: "text", label: "Question 4: hint", max: 34, tokens: ["{min}", "{max}"] },
    oneUnit: { kind: "text", label: "One unit", max: 16, tokens: ["{count}"], hint: "As in “PureFlow UF · 1 unit”." },
    manyUnits: { kind: "text", label: "Several units", max: 16, tokens: ["{count}"], hint: "As in “PureFlow UF · 3 units”." },
    title: { kind: "text", label: "Quote panel: heading", max: 24 },
    titleWithPrice: { kind: "text", label: "Quote panel: heading while prices are shown", max: 24 },
    emptyTitle: { kind: "text", label: "Quote panel before a province is chosen: heading", max: 30 },
    emptyText: { kind: "text", label: "Quote panel before a province is chosen: text", max: 218 },
    emptyTextWithPrice: { kind: "text", label: "Quote panel before a province is chosen: text while prices are shown", max: 218 },
    rentalLine: { kind: "text", label: "Line 1: monthly rental", max: 30 },
    rentalDetail: {
      kind: "text",
      label: "Line 1: detail",
      max: 40,
      tokens: ["{plan}", "{units}"],
      hint: "{plan} is the chosen plan and {units} the number of units, e.g. “3 units”.",
    },
    regionalLine: { kind: "text", label: "Line 2: Regional Hydration Service", max: 32, hint: "Only outside the Western Province." },
    regionalDetail: { kind: "text", label: "Line 2: detail", max: 110 },
    initialLine: { kind: "text", label: "Line 3: initial payment", max: 30 },
    initialDetail: { kind: "text", label: "Line 3: detail", max: 50, hint: "Shown while the initial payment is hidden." },
    initialDetailWithPrice: {
      kind: "text",
      label: "Line 3: detail while the initial payment is shown",
      max: 70,
      tokens: ["{price}"],
      hint: "{price} is the initial payment per unit.",
    },
    everyMonth: { kind: "text", label: "Beside a monthly line", max: 18, hint: "Shown while prices are hidden." },
    firstMonthOnly: { kind: "text", label: "Beside the initial payment", max: 18, hint: "Shown while prices are hidden." },
    confirmed: {
      kind: "text",
      label: "In place of an amount that isn’t shown",
      max: 28,
      hint: "Used while some prices are shown and others aren’t.",
    },
    firstMonthLabel: { kind: "text", label: "First month box: label", max: 24 },
    firstMonthLabelWithPrice: { kind: "text", label: "First month box: label while prices are shown", max: 27 },
    firstMonth: {
      kind: "text",
      label: "First month box: Western Province",
      max: 60,
      hint: "Shown while prices are hidden; the total replaces it while they’re shown.",
    },
    firstMonthRegional: {
      kind: "text",
      label: "First month box: outside the Western Province",
      max: 60,
      hint: "Shown while prices are hidden; the total replaces it while they’re shown.",
    },
    laterLabel: { kind: "text", label: "Second box: label", max: 24 },
    later: {
      kind: "text",
      label: "Second box: Western Province",
      max: 60,
      hint: "Shown while prices are hidden; the monthly total replaces it while they’re shown.",
    },
    laterRegional: {
      kind: "text",
      label: "Second box: outside the Western Province",
      max: 60,
      hint: "Shown while prices are hidden; the monthly total replaces it while they’re shown.",
    },
    note: { kind: "text", label: "Note under the boxes", max: 178 },
    button: { kind: "text", label: "Button (opens the quote form)", max: 26 },
    buttonWithPrice: { kind: "text", label: "Button while prices are shown", max: 26 },
  },
  defaults: {
    provinceLabel: "Where will it be installed?",
    provincePlaceholder: "Select your province",
    provinceHint: "We ask first, because rentals outside the Western Province include the Regional Hydration Service.",
    customerLabel: "Who is it for?",
    customers: ["Home", "Office", "Company"],
    homeHint: "For homes, buying is usually the better long-term value.",
    homeLink: "Explore purifiers",
    officeHint: "Installation, maintenance and support are included, according to your rental agreement.",
    companyHint: "Several sites or many units?",
    companyLink: "Get a corporate proposal",
    purificationLabel: "Purification",
    planPrice: "From {price}",
    purificationHint: "Not sure which?",
    purificationLink: "Check my water",
    unitsLabel: "Number of units",
    unitsHint: "From {min} to {max} units.",
    oneUnit: "{count} unit",
    manyUnits: "{count} units",
    title: "Your rental quote",
    titleWithPrice: "Your rental estimate",
    emptyTitle: "Start with your province",
    emptyText:
      "Choose where your purifier will be installed and we’ll show every line your quote will carry: the monthly rental, the one-time initial payment and anything else that applies to you.",
    emptyTextWithPrice:
      "Choose where your purifier will be installed and we’ll show every charge, line by line: the monthly rental, the one-time initial payment and anything else that applies to you.",
    rentalLine: "Monthly rental",
    rentalDetail: "{plan} · {units}",
    regionalLine: "Regional Hydration Service",
    regionalDetail: "Technical service, preventive maintenance and regional support outside the Western Province",
    initialLine: "One-time initial payment",
    initialDetail: "Per unit, payable only in the first month",
    initialDetailWithPrice: "{price} per unit, payable only in the first month",
    everyMonth: "Every month",
    firstMonthOnly: "First month only",
    confirmed: "Confirmed in your quote",
    firstMonthLabel: "In the first month",
    firstMonthLabelWithPrice: "Due in the first month",
    firstMonth: "Monthly rental + initial payment",
    firstMonthRegional: "Monthly rental + regional service + initial payment",
    laterLabel: "From month two",
    later: "Monthly rental only",
    laterRegional: "Monthly rental + regional service only",
    note: "Western Province: rental only. Outside the Western Province, the Regional Hydration Service is shown as a separate line, never hidden in the rental.",
    button: "Get my rental quote",
    buttonWithPrice: "Get this quote",
  },
});

/** The two "Transparent charges" cards under the quote builder. Their amounts are in Prices & quotes. */
export const rentalCharges = defineBlock({
  key: "rental.charges",
  label: "Transparent charges",
  description:
    "The two cards under the quote builder. While an amount is switched on in Prices & quotes, it replaces the card’s big text.",
  fields: {
    title: { kind: "text", label: "Heading", max: 24 },
    note: { kind: "text", label: "Note beside the heading", max: 40, hint: "“All amounts exclude VAT.” always follows it." },
    cards: {
      kind: "cards",
      label: "Cards",
      count: [2, 2],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["One-time initial payment", "Regional Hydration Service"],
      hint: "While the card’s amount is switched on in Prices & quotes, the amount replaces the big text and the small text after the amount follows it.",
      item: {
        title: { kind: "text", label: "Title", max: 32 },
        when: { kind: "text", label: "Big text (while the amount is hidden)", max: 18 },
        unit: { kind: "text", label: "Small text after the big text", max: 34 },
        unitWithPrice: { kind: "text", label: "Small text after the amount (while it’s shown)", max: 34 },
        body: { kind: "text", label: "Text", max: 120 },
      },
    },
  },
  defaults: {
    title: "Transparent charges",
    note: "Listed separately on every quote.",
    cards: [
      {
        title: "One-time initial payment",
        when: "First month only",
        unit: "per unit",
        unitWithPrice: "per unit",
        body: "Payable only in the first month. From the second month onwards, you pay only the monthly rental.",
      },
      {
        title: "Regional Hydration Service",
        when: "Its own line",
        unit: "outside the Western Province",
        unitWithPrice: "per unit, per month",
        body: "Outside the Western Province only. Always shown as a separate line, never hidden inside the rental.",
      },
    ],
  },
});

/** The deep-blue Regional Hydration Service band and its two example cards. */
export const rentalRegional = defineBlock({
  key: "rental.regional",
  label: "Regional Hydration Service band",
  description: "The deep-blue band that explains the Regional Hydration Service, with its three tags and the two example cards.",
  fields: {
    pill: { kind: "text", label: "Tag above the heading", max: 32 },
    title: { kind: "text", label: "Heading", max: 52 },
    text: { kind: "text", label: "Text", max: 222 },
    chips: {
      kind: "list",
      label: "Tags under the text",
      count: [3, 3],
      max: 34,
      reorder: false,
      itemLabel: "Tag",
      itemNames: ["Additional technical service", "Preventive maintenance", "Regional support"],
    },
    examplesTitle: { kind: "text", label: "Heading over the example cards", max: 30 },
    westernLabel: { kind: "text", label: "Western Province card: label", max: 34 },
    westernTitle: { kind: "text", label: "Western Province card: title", max: 42 },
    westernLine: { kind: "text", label: "Western Province card: line", max: 34 },
    outsideLabel: { kind: "text", label: "Outside card: label", max: 34 },
    outsideTitle: { kind: "text", label: "Outside card: title", max: 42 },
    outsideRentalLine: { kind: "text", label: "Outside card: first line", max: 34 },
    outsideRegionalLine: { kind: "text", label: "Outside card: second line", max: 34 },
    regionalNote: {
      kind: "text",
      label: "Outside card: note after the second line",
      max: 48,
      hint: "Shown while the Regional Hydration Service amount is hidden.",
    },
    regionalNoteWithPrice: {
      kind: "text",
      label: "Outside card: note while the amount is shown",
      max: 48,
      tokens: ["{price}"],
      hint: "{price} is the Regional Hydration Service charge per unit, per month.",
    },
  },
  defaults: {
    pill: "Regional Hydration Service",
    title: "The same standard of care, wherever you are",
    text: "For customers outside the Western Province, a Regional Hydration Service charge applies to cover additional technical service, preventive maintenance and regional support requirements.",
    chips: ["Additional technical service", "Preventive maintenance", "Regional support"],
    examplesTitle: "How it shows on your quote",
    westernLabel: "Western Province",
    westernTitle: "Rental only",
    westernLine: "Monthly rental",
    outsideLabel: "Outside the Western Province",
    outsideTitle: "Rental + Regional Hydration Service",
    outsideRentalLine: "Monthly rental",
    outsideRegionalLine: "Regional Hydration Service",
    regionalNote: "· separate line, confirmed in your quote",
    regionalNoteWithPrice: "· {price} per unit, per month",
  },
});

/** The rental enquiry section: its heading, the two cross-link cards and the form card. Links stay in the code. */
export const rentalEnquiry = defineBlock({
  key: "rental.enquiry",
  label: "Rent for your office (the form)",
  description: "The heading beside the rental form, the two cards under the steps and the form card’s heading.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 20 },
    title: {
      kind: "text",
      label: "Heading",
      max: 36,
      marks: "one",
      hint: "Wrap one phrase in *asterisks* to set it in blue, like *your office*.",
    },
    description: { kind: "text", label: "Text", max: 130 },
    stepsTitle: { kind: "text", label: "Label above the steps", max: 24 },
    links: {
      kind: "cards",
      label: "Cards under the steps",
      count: [2, 2],
      reorder: false,
      itemLabel: "Card",
      itemNames: ["Opens Corporate hydration", "Opens Water purifiers"],
      item: {
        title: { kind: "text", label: "Title", max: 40 },
        body: { kind: "text", label: "Text", max: 90 },
      },
    },
    formTitle: { kind: "text", label: "Form card: heading", max: 34 },
    formText: { kind: "text", label: "Form card: text", max: 160 },
  },
  defaults: {
    eyebrow: "Office rental",
    title: "Rent LUSAKO for *your office*",
    description: "A short brief is all we need. Our rental team will recommend machines and a monthly plan for your workplace.",
    stepsTitle: "What happens next",
    links: [
      { title: "Renting across several locations?", body: "Get a corporate proposal, so you don’t have to choose machines one by one." },
      { title: "Renting for your home?", body: "Buying is usually the better long-term value." },
    ],
    formTitle: "Tell us about your workplace",
    formText:
      "Share your team size, the number of units you need and your water source. We’ll reply with next steps and arrange a site assessment.",
  },
});

/** "What happens next": the three numbered steps beside the rental form. */
export const rentalNextSteps = defineBlock({
  key: "rental.nextSteps",
  label: "What happens next: the steps",
  description: "The three numbered steps beside the rental form.",
  fields: {
    steps: {
      kind: "cards",
      label: "Steps",
      count: [3, 3],
      itemLabel: "Step",
      item: {
        title: { kind: "text", label: "Step", max: 20 },
        body: { kind: "text", label: "Text", max: 105 },
      },
    },
  },
  defaults: {
    steps: [
      { title: "Site assessment", body: "We check your water source and where the machines should go." },
      { title: "Quote", body: "A clear quote with the machines, the monthly rental and every charge listed separately." },
      { title: "Installation", body: "Professional installation, ready for your team on day one." },
    ],
  },
});

/** The heading over the rental questions (the questions themselves are in FAQs). */
export const rentalFaq = defineBlock({
  key: "rental.faq",
  label: "Questions",
  description: "The heading over the rental questions. The questions themselves are in FAQs.",
  fields: {
    title: { kind: "text", label: "Heading", max: 32 },
  },
  defaults: {
    title: "Rental questions, answered",
  },
});

export const blocks: AnyBlock[] = [
  rentalSeo,
  rentalHero,
  rentalWhy,
  rentalPlansCopy,
  rentalAquaspark,
  rentalQuote,
  rentalQuoteBuilder,
  rentalCharges,
  rentalRegional,
  rentalEnquiry,
  rentalNextSteps,
  rentalFaq,
];
