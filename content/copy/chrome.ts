import { chromeContactLabels } from "./chrome-labels";
import { site } from "../site";
import { defineBlock, type AnyBlock } from "./schema";

/** Header, footer & contact panels: its editable text. Every block's defaults are the page's wording as designed. */

/**
 * The whole site's search description and its share card (app/layout.tsx, the LocalBusiness and WebSite structured
 * data, the home-screen manifest and the /og image). The brand name and tagline stay in the code.
 */
export const chromeSite = defineBlock({
  key: "chrome.site",
  label: "Search & sharing (whole site)",
  description:
    "The description search engines use when a page has none of its own, and the card social apps show when a link to the website is shared. Social apps keep an old card for a while after it changes.",
  fields: {
    description: {
      kind: "text",
      label: "Website description",
      max: 165,
      hint: "Also used in Google’s business details and when the website is saved to a phone’s home screen. Aim for 120 to 160 characters.",
    },
    cardLead: { kind: "text", label: "Share card: headline, first line", max: 22, hint: "Set in brand blue." },
    cardRest: { kind: "text", label: "Share card: headline, second line", max: 22 },
    cardText: { kind: "text", label: "Share card: text", max: 110 },
    cardFooter: { kind: "text", label: "Share card: bottom line", max: 32, hint: "Written in capitals, as shown." },
    imageAlt: {
      kind: "text",
      label: "Share card: description for screen readers",
      max: 80,
      hint: "Read out instead of the card by screen readers.",
    },
  },
  defaults: {
    description: site.description,
    cardLead: "Pure water",
    cardRest: "without the hassle",
    cardText: "Water purification and hydration solutions for homes, offices and businesses in Sri Lanka.",
    cardFooter: "BUY • RENT • HYDRATE • CARE",
    imageAlt: "LUSAKO: Better Water. Better Way.",
  },
});

/** The navigation bar's "Contact / Get a quote" button and the panel it opens on computers (components/layout/header.tsx). */
export const chromeContactMenu = defineBlock({
  key: "chrome.contactMenu",
  label: "Navigation: contact menu",
  description:
    "The “Contact / Get a quote” button in the navigation bar on computers and the panel it opens. The numbers and emails are in Contact & social; the button at the bottom opens the Contact page.",
  fields: {
    button: { kind: "text", label: "Button in the navigation bar", max: 23, hint: "Stays on one line next to the menu, so keep it short." },
    title: { kind: "text", label: "Heading", max: 24 },
    text: { kind: "text", label: "Text under the heading", max: 61 },
    quoteText: { kind: "text", label: "Line next to the bottom button", max: 66 },
    quoteButton: { kind: "text", label: "Bottom button", max: 16, hint: "Sits on the same line as the text next to it, so keep it short." },
  },
  defaults: {
    button: "Contact / Get a quote",
    title: "Talk to LUSAKO",
    text: "Call, message or email, or send us a quote request.",
    quoteText: "Tell us what you need and we’ll come back with a quote.",
    quoteButton: "Get a quote",
  },
});

/** The menu that opens from the menu button on phones and tablets (components/layout/header.tsx). */
export const chromeMobileMenu = defineBlock({
  key: "chrome.mobileMenu",
  label: "Phone & tablet menu",
  description:
    "The menu that opens from the menu button on phones and tablets: its two buttons under the links, and the heading over the contact details. The links themselves stay as they are.",
  fields: {
    contactButton: { kind: "text", label: "First button (opens Contact)", max: 25 },
    finderButton: { kind: "text", label: "Second button (opens Find my solution)", max: 25 },
    title: { kind: "text", label: "Heading over the contact details", max: 24 },
  },
  defaults: {
    contactButton: "Contact / Get a quote",
    finderButton: "Find my solution",
    title: "Talk to LUSAKO",
  },
});



/** The footer's wording (components/layout/footer.tsx). Its links, the tagline and the company name stay in the code. */
export const chromeFooter = defineBlock({
  key: "chrome.footer",
  label: "Footer",
  description:
    "The text under the logo, the two buttons, the column headings and the line in the bottom corner. The links in each column stay as they are; the first column lists your water purifiers.",
  fields: {
    text: { kind: "text", label: "Text under the logo", max: 120 },
    contactButton: { kind: "text", label: "First button (opens Contact)", max: 25 },
    whatsappButton: { kind: "text", label: "WhatsApp button", max: 14, hint: "Shown while there is a WhatsApp sales number in Contact & social." },
    columns: {
      kind: "list",
      label: "Column headings",
      count: [4, 4],
      max: 24,
      reorder: false,
      itemLabel: "Heading",
      itemNames: ["Column 1 (your water purifiers)", "Column 2 (hydration links)", "Column 3 (company links)", "Column 4 (support links)"],
    },
    closing: { kind: "text", label: "Line in the bottom corner", max: 32, hint: "Written in capitals, as shown." },
  },
  defaults: {
    text: "Water purification and hydration solutions for homes, offices and organisations across Sri Lanka.",
    contactButton: "Contact / Get a quote",
    whatsappButton: "WhatsApp",
    columns: ["Water purifiers", "Hydration solutions", "Company", "Support"],
    closing: "BUY • RENT • HYDRATE • CARE",
  },
});

/** The phone action bar and the contact sheet its third button opens (mobile-cta-bar.tsx, contact-sheet.tsx). */
export const chromeActionBar = defineBlock({
  key: "chrome.actionBar",
  label: "Phone action bar & contact sheet",
  description:
    "The three buttons fixed to the bottom of the screen on phones, and the contact sheet the third one opens. Buy opens Water purifiers, Rent opens Rental.",
  fields: {
    actions: {
      kind: "cards",
      label: "Buttons",
      count: [3, 3],
      reorder: false,
      itemLabel: "Button",
      itemNames: ["Buy (opens Water purifiers)", "Rent (opens Rental)", "Contact (opens the contact sheet)"],
      item: {
        label: { kind: "text", label: "Label", max: 12 },
        hint: { kind: "text", label: "Small line", max: 20 },
      },
      hint: "Three buttons share a phone’s width, so keep both lines short.",
    },
    sheetTitle: { kind: "text", label: "Contact sheet: heading", max: 24 },
    sheetButton: { kind: "text", label: "Contact sheet: button (opens Contact)", max: 24 },
  },
  defaults: {
    actions: [
      { label: "Buy", hint: "Own your system" },
      { label: "Rent", hint: "Monthly plan" },
      { label: "Contact", hint: "Call or get a quote" },
    ],
    sheetTitle: "Talk to LUSAKO",
    sheetButton: "Get a quote",
  },
});

/** The round WhatsApp button in the corner of every page (components/layout/whatsapp-button.tsx). */
export const chromeWhatsappButton = defineBlock({
  key: "chrome.whatsappButton",
  label: "Floating WhatsApp button",
  description:
    "The round WhatsApp button in the corner of every page. Switch it off, set its number and the message it opens with in Contact & social.",
  fields: {
    label: {
      kind: "text",
      label: "Description for screen readers",
      max: 60,
      hint: "The button shows only the WhatsApp mark; this is read out to people using a screen reader.",
    },
  },
  defaults: { label: "Chat with LUSAKO on WhatsApp" },
});

export { chromeContactLabels };

export const blocks: AnyBlock[] = [
  chromeSite,
  chromeContactMenu,
  chromeMobileMenu,
  chromeContactLabels,
  chromeFooter,
  chromeActionBar,
  chromeWhatsappButton,
];
