import { defineBlock } from "./schema";

/**
 * The Buy and Rent tiles on every purifier card (the catalogue, the home carousel and "Other purifiers" on product
 * pages). The amounts, "+ VAT" and "/mo" stay in the code.
 */
export const purifiersCard = defineBlock({
  key: "purifiers.card",
  label: "Purifier cards: Buy and Rent tiles",
  description:
    "The two tiles at the bottom of every purifier card, here, on the home page and on product pages. While a price is hidden a tile asks for a quote; prices are switched on in Prices & quotes.",
  fields: {
    buy: { kind: "text", label: "Buy tile: label", max: 12, hint: "Also shown before the price of a purifier with one option." },
    buyFrom: {
      kind: "text",
      label: "Buy tile: label when a price is shown",
      max: 12,
      hint: "Used when the purifier comes in more than one option, before its lowest price.",
    },
    rent: { kind: "text", label: "Rent tile: label", max: 12 },
    rentFrom: { kind: "text", label: "Rent tile: label when a price is shown", max: 12, hint: "Shown before the lowest monthly rental." },
    quote: { kind: "text", label: "Tile text while the price is hidden (both tiles)", max: 13 },
  },
  defaults: {
    buy: "Buy",
    buyFrom: "Buy from",
    rent: "Rent",
    rentFrom: "Rent from",
    quote: "Get a quote",
  },
});
