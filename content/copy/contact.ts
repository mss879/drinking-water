import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Contact: its editable text. Every block's defaults are the page's wording as designed. */

export const contactSeo = seoBlock("contact", {
  title: "Contact / Get a Quote",
  description:
    "Call, WhatsApp or email LUSAKO, reach the breakdown hotline, or get a quote to buy or rent a water purifier, plan corporate hydration or book a service.",
});

export const contactHero = defineBlock({
  key: "contact.hero",
  label: "Hero",
  description: "The label, headline and intro over the phone photo, and the two buttons.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the headline", max: 26 },
    title: {
      kind: "list",
      label: "Headline",
      count: [2, 2],
      max: 24,
      marks: "optional",
      itemLabel: "Line",
      hint: "Two short lines, each on its own line. Wrap the words shown in blue in *asterisks*, like you *need*.",
    },
    description: { kind: "text", label: "Intro", max: 200 },
    quoteButton: { kind: "text", label: "First button (goes to the enquiry form)", max: 20 },
    callButton: {
      kind: "text",
      label: "Second button (calls the first office number)",
      max: 20,
      tokens: ["{phone}"],
      hint: "{phone} is replaced with the first office number from Contact & social.",
    },
  },
  defaults: {
    eyebrow: "Contact / Get a quote",
    title: ["Tell us what", "you *need*"],
    description:
      "Call, message or email the LUSAKO team, or choose the enquiry that fits below. Your request goes straight to the right team: direct sales, rental, business or service.",
    quoteButton: "Get a quote",
    callButton: "Call {phone}",
  },
});

/** The four contact cards under the hero. Their numbers and addresses come from Contact & social. */
export const contactCards = defineBlock({
  key: "contact.cards",
  label: "Contact cards",
  description:
    "The titles of the four cards under the hero and the small labels over their numbers. The numbers and email addresses are in Contact & social; a card without any is left out.",
  fields: {
    callTitle: { kind: "text", label: "Card 1: title (office numbers)", max: 24 },
    emergencyTitle: { kind: "text", label: "Card 2: title (the dark breakdown card)", max: 24 },
    hotlineLabel: { kind: "text", label: "Card 2: label over the hotline number", max: 26 },
    emergencyWhatsappLabel: { kind: "text", label: "Card 2: label over the WhatsApp number", max: 26 },
    whatsappTitle: { kind: "text", label: "Card 3: title (WhatsApp sales)", max: 24 },
    emailTitle: { kind: "text", label: "Card 4: title (email addresses)", max: 24 },
    salesEmailLabel: { kind: "text", label: "Card 4: label over the sales email", max: 26 },
    operationsEmailLabel: { kind: "text", label: "Card 4: label over the operations email", max: 26 },
  },
  defaults: {
    callTitle: "Call us",
    emergencyTitle: "Emergency breakdown",
    hotlineLabel: "Hotline",
    emergencyWhatsappLabel: "WhatsApp",
    whatsappTitle: "WhatsApp sales",
    emailTitle: "Email",
    salesEmailLabel: "Sales",
    operationsEmailLabel: "Technical & operations",
  },
});

/** The two link cards under the address card, beside the form. Where they lead stays in the code. */
export const contactPromos = defineBlock({
  key: "contact.promos",
  label: "Cards beside the form",
  description: "The blue Find my solution card and the Request a service card under the address.",
  fields: {
    finderLabel: { kind: "text", label: "Blue card: small line above the title", max: 28 },
    finderTitle: { kind: "text", label: "Blue card: title (opens Find my solution)", max: 20 },
    finderText: { kind: "text", label: "Blue card: text", max: 86 },
    serviceLabel: { kind: "text", label: "Service card: small line above the title", max: 22 },
    serviceTitle: { kind: "text", label: "Service card: title (opens the service request form)", max: 22 },
  },
  defaults: {
    finderLabel: "Not sure what you need?",
    finderTitle: "Find my solution",
    finderText: "Three quick questions and we’ll recommend UF or RO and the right system.",
    serviceLabel: "Existing customer?",
    serviceTitle: "Request a service",
  },
});

export const blocks: AnyBlock[] = [contactSeo, contactHero, contactCards, contactPromos];
