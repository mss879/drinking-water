import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Service & support: its editable text. Every block's defaults are the page's wording as designed. */

export const serviceSeo = seoBlock("service", {
  title: "Service & Support",
  description:
    "LUSAKO Care: installation, preventive maintenance, filter replacement, repairs, AMC plans and rental support for your purifier. Request a service online.",
});

export const serviceHero = defineBlock({
  key: "service.hero",
  label: "Hero",
  description: "The label, headline and intro over the technician photo, and the two buttons.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 24 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 26,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each on its own line. Wrap the words shown in blue in *asterisks*, like *performing at its best*.",
    },
    description: { kind: "text", label: "Intro", max: 185, multiline: true },
    requestButton: { kind: "text", label: "First button (goes to the service request form)", max: 24 },
    whatsappButton: { kind: "text", label: "Second button (opens WhatsApp)", max: 20 },
  },
  defaults: {
    eyebrow: "LUSAKO Care",
    title: ["Keep your system", "*performing at its best*"],
    description:
      "Professional installation, preventive maintenance, filter replacement and technical support from one LUSAKO team, for systems you own and systems you rent.",
    requestButton: "Request a service",
    whatsappButton: "WhatsApp us",
  },
});

export const serviceStrip = defineBlock({
  key: "service.strip",
  label: "Strip under the hero",
  description: "The line that sums the page up, the sentence under it and the pills on the right.",
  fields: {
    title: { kind: "text", label: "Heading", max: 40 },
    description: { kind: "text", label: "Text", max: 83 },
    pills: { kind: "list", label: "Pills", count: [1, 5], max: 16, itemLabel: "Pill" },
  },
  defaults: {
    title: "Care that comes with every system",
    description: "Trained LUSAKO technicians, scheduled visits and genuine spare parts.",
    pills: ["Installation", "Maintenance", "Support"],
  },
});

export const serviceServices = defineBlock({
  key: "service.services",
  label: "What LUSAKO Care covers",
  description:
    "The heading over the services. The services themselves (their names and descriptions) are in Shared sections › LUSAKO Care services.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 28 },
    title: { kind: "text", label: "Heading", max: 54, marks: "one" },
    description: { kind: "text", label: "Text", max: 115, multiline: true },
  },
  defaults: {
    eyebrow: "What LUSAKO Care covers",
    title: "Everything your system needs, *from one team*",
    description: "From installation day to every scheduled visit after it, LUSAKO looks after your drinking water.",
  },
});

export const serviceAmc = defineBlock({
  key: "service.amc",
  label: "AMC & service plans",
  description: "The heading over the three AMC plan cards. The plans’ names, prices and visits are in AMC plans.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 43, marks: "one" },
    description: { kind: "text", label: "Text", max: 190, multiline: true },
    button: { kind: "text", label: "Button (opens the AMC plan comparison)", max: 24 },
  },
  defaults: {
    eyebrow: "AMC & service plans",
    title: "Annual care for *a purchased system*",
    description:
      "Planned visits, tank sanitation and breakdown support, with discounts on filters and spare parts. Prefer to pay per visit? On-call service is always available.",
    button: "Compare the plans",
  },
});

export const serviceParts = defineBlock({
  key: "service.parts",
  label: "Filters & parts card",
  description: "The light card that links to Filters, parts & accessories.",
  fields: {
    pill: { kind: "text", label: "Pill", max: 20 },
    title: { kind: "text", label: "Heading", max: 31 },
    body: { kind: "text", label: "Text", max: 146, multiline: true },
    checklist: { kind: "list", label: "Checklist", count: [2, 5], max: 32, itemLabel: "Item" },
    button: { kind: "text", label: "Button (opens Filters, parts & accessories)", max: 24 },
  },
  defaults: {
    pill: "Genuine parts",
    title: "Filters, parts & accessories",
    body: "Genuine filter cartridges, spare parts and accessories for your LUSAKO purifier, fitted by our technicians if you need us.",
    checklist: ["Water filter cartridges", "Water purifier spare parts", "Water purifier accessories"],
    button: "Browse parts",
  },
});

export const serviceRental = defineBlock({
  key: "service.rental",
  label: "Rental customers card",
  description:
    "The dark card for rental customers. Its phone button shows the first number in Contact & social, and the note that exact inclusions are confirmed in the rental agreement stays as it is.",
  fields: {
    pill: { kind: "text", label: "Pill", max: 20 },
    title: { kind: "text", label: "Heading", max: 28 },
    body: { kind: "text", label: "Text", max: 196, multiline: true },
    checklist: { kind: "list", label: "Checklist", count: [2, 6], max: 56, itemLabel: "Item" },
    button: { kind: "text", label: "Button (goes to the service request form)", max: 24 },
  },
  defaults: {
    pill: "Rental customers",
    title: "Renting? We look after it",
    body: "Rental systems are maintained by LUSAKO throughout the rental period, according to your agreement. If something needs attention, tell us and we’ll take care of it.",
    checklist: [
      "Professional installation",
      "Scheduled preventive maintenance",
      "Filter replacement, according to your agreement",
      "Technical support throughout the rental period",
    ],
    button: "Request a service",
  },
});

export const serviceRequest = defineBlock({
  key: "service.request",
  label: "Request a service",
  description:
    "The heading beside the service request form and the tip under the contact lines. The contact lines’ numbers are in Contact & social, and their names in Header, footer & contact panels › Contact details: names.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 31, marks: "one" },
    description: { kind: "text", label: "Text", max: 132, multiline: true },
    tip: {
      kind: "text",
      label: "Tip",
      max: 138,
      multiline: true,
      marks: "optional",
      hint: "Wrap the opening word in *asterisks* to set it in bold, like *Tip:*.",
    },
  },
  defaults: {
    eyebrow: "Request a service",
    title: "Tell us what’s *happening*",
    description: "Existing LUSAKO customers can raise a request here. Our service team will contact you to confirm a visit time.",
    tip: "*Tip:* have your model and serial or asset number handy if you can. It helps our technicians prepare for the visit.",
  },
});

export const serviceFaq = defineBlock({
  key: "service.faq",
  label: "Questions",
  description: "The heading of the questions block. The questions are the Installation & service ones in FAQs.",
  fields: {
    title: { kind: "text", label: "Heading", max: 32 },
  },
  defaults: {
    title: "Service questions, answered",
  },
});

export const blocks: AnyBlock[] = [
  serviceSeo,
  serviceHero,
  serviceStrip,
  serviceServices,
  serviceAmc,
  serviceParts,
  serviceRental,
  serviceRequest,
  serviceFaq,
];
