import { sectors } from "../clients";
import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Our clients: its editable text. Every block's defaults are the page's wording as designed. */

export const clientsSeo = seoBlock("clients", {
  title: "Our Clients & Success Stories",
  description:
    "How LUSAKO looks after drinking water for offices, factories, hotels, schools and hospitals, from the first challenge to ongoing support.",
});

/** The page's header: label, two-line headline and intro over the photo. */
export const clientsHero = defineBlock({
  key: "clients.hero",
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
    description: { kind: "text", label: "Intro", max: 155 },
  },
  defaults: {
    eyebrow: "Our clients",
    title: ["Our clients &", "*success stories*"],
    description:
      "From single offices to multi-site organisations, LUSAKO plans, installs and looks after drinking water. Here’s how that work comes together.",
  },
});

/** Each sector's line, by its name (the sectors and their icons stay as they are). */
const sectorHints: Record<string, string> = {
  "Corporate offices": "Pantries, meeting floors and reception areas.",
  Factories: "Canteens and production floors with shift teams.",
  Hotels: "Restaurants, lounges and staff areas.",
  Schools: "Pure water for students, staff and visitors.",
  Hospitals: "Clinics and waiting areas that need water all day.",
  "Commercial organisations": "Branches, showrooms and customer areas.",
};

/** "Sectors we serve": the heading and the line on each sector's card. */
export const clientsSectors = defineBlock({
  key: "clients.sectors",
  label: "Sectors we serve",
  description: "The heading and the line under each sector’s name. The sectors’ names and icons stay as they are.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 45, marks: "one" },
    description: { kind: "text", label: "Text beside the heading", max: 124 },
    hints: {
      kind: "list",
      label: "Line under each sector",
      count: [sectors.length, sectors.length],
      max: 60,
      reorder: false,
      itemLabel: "Sector",
      itemNames: sectors,
    },
  },
  defaults: {
    eyebrow: "Sectors we serve",
    title: "From corporate offices *to hospitals*",
    description: "Every sector uses water differently. We match machines, placement and service to how your people drink.",
    hints: sectors.map((sector) => sectorHints[sector]),
  },
});

/** "Client logos": the heading over the logos, and the card shown while none are published. */
export const clientsLogos = defineBlock({
  key: "clients.logos",
  label: "Client logos",
  description:
    "The heading over the client logos (added in Client logos) and the card shown in their place while none are published.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 39, marks: "one" },
    emptyTitle: { kind: "text", label: "Card while there are no logos: heading", max: 30 },
    emptyText: { kind: "text", label: "Card while there are no logos: text", max: 118 },
  },
  defaults: {
    eyebrow: "Client logos",
    title: "The organisations *we work with*",
    emptyTitle: "Published with permission",
    emptyText: "We show a client’s name or logo only with their written approval. Approved logos will appear here.",
  },
});

/** "Success stories": the heading, the sample-story note and the names of each story's six steps. */
export const clientsStories = defineBlock({
  key: "clients.stories",
  label: "Success stories",
  description:
    "The heading over the client stories, the note shown while any story is a sample, and the names of each story’s steps. The stories themselves are in Client stories.",
  fields: {
    eyebrow: { kind: "text", label: "Label above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 32, marks: "one" },
    description: { kind: "text", label: "Text beside the heading", max: 160 },
    samplePill: { kind: "text", label: "Tag on a sample story", max: 16 },
    sampleNote: {
      kind: "text",
      label: "Note while any story is a sample",
      max: 146,
      hint: "Shown above the stories only while at least one published story is marked as a sample. If you rename the sample tag, change its name here too.",
    },
    steps: {
      kind: "list",
      label: "Step names",
      count: [6, 6],
      max: 20,
      reorder: false,
      itemLabel: "Step",
      itemNames: ["Challenge", "Requirement", "LUSAKO solution", "Implementation", "Ongoing support", "Result (the shaded last step)"],
      hint: "Set in small capitals above each part of a story. Each keeps its icon.",
    },
  },
  defaults: {
    eyebrow: "Success stories",
    title: "From challenge *to result*",
    description:
      "Every LUSAKO project follows the same path: understand the challenge, match the solution, install it properly and keep it performing.",
    samplePill: "Sample story",
    sampleNote: "Stories marked “Sample story” show how a typical LUSAKO project runs. They will be replaced with approved client stories.",
    steps: ["Challenge", "Requirement", "LUSAKO solution", "Implementation", "Ongoing support", "Result"],
  },
});

/** The deep-blue corporate band near the bottom of the page. The buttons' destinations stay in the code. */
export const clientsCorporate = defineBlock({
  key: "clients.corporate",
  label: "Corporate hydration band",
  description: "The deep-blue band near the bottom of the page: its tag, heading, text and two buttons.",
  fields: {
    tag: { kind: "text", label: "Tag above the heading", max: 24 },
    title: { kind: "text", label: "Heading", max: 48 },
    description: { kind: "text", label: "Text", max: 173 },
    exploreButton: { kind: "text", label: "First button (opens Corporate hydration)", max: 33 },
    quoteButton: { kind: "text", label: "Second button (opens the business quote form on Contact)", max: 29 },
  },
  defaults: {
    tag: "Corporate hydration",
    title: "Planning water for a whole organisation?",
    description:
      "One partner for your workplace hydration: site assessment, the right mix of machines, installation and ongoing service, across one site or many.",
    exploreButton: "Explore corporate hydration",
    quoteButton: "Request a business quote",
  },
});

export const blocks: AnyBlock[] = [clientsSeo, clientsHero, clientsSectors, clientsLogos, clientsStories, clientsCorporate];
