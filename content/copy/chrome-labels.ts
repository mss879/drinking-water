import { defineBlock } from "./schema";

/** The name over each contact detail, in contactRows' order (components/layout/contact-list.tsx). */
export const chromeContactLabels = defineBlock({
  key: "chrome.contactLabels",
  label: "Contact details: names",
  description:
    "The small name over each contact detail in the navigation’s contact panel, the phone menu, the phone contact sheet and the footer. The details themselves are in Contact & social; a detail left empty there is hidden with its name.",
  fields: {
    labels: {
      kind: "list",
      label: "Names",
      count: [8, 8],
      max: 34,
      reorder: false,
      itemLabel: "Name",
      itemNames: [
        "Phone numbers",
        "Emergency hotline",
        "WhatsApp (sales)",
        "WhatsApp (emergency)",
        "Sales email",
        "Operations email",
        "Opening hours",
        "Address",
      ],
    },
  },
  defaults: {
    labels: [
      "Call us",
      "Emergency breakdown hotline",
      "WhatsApp sales",
      "WhatsApp emergency breakdown",
      "Sales",
      "Technical & operations",
      "Hours",
      "Visit us",
    ],
  },
});
