import { defineBlock, seoBlock, type AnyBlock } from "./schema";

/** Blog: its editable text. Every block's defaults are the page's wording as designed. */

export const blogSeo = seoBlock("blog", {
  title: "Water & Hydration Blog",
  description: "Guides and news from LUSAKO on water purification, UF and RO, office hydration, rental and keeping your water at its best.",
});

/** The blog's header: label, two-line headline and intro over the photo. */
export const blogHero = defineBlock({
  key: "blog.hero",
  label: "Hero",
  description: "The label, headline and line under it over the photo at the top of the blog.",
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
    description: { kind: "text", label: "Intro", max: 110 },
  },
  defaults: {
    eyebrow: "Blog",
    title: ["Better water,", "*explained*"],
    description: "Guides, tips and news from LUSAKO on purification, rental and drinking water at home and at work.",
  },
});

/** The card shown in place of the articles while none are published. The button's destination stays in the code. */
export const blogEmpty = defineBlock({
  key: "blog.empty",
  label: "No articles yet",
  description: "The card shown in place of the articles while none are published.",
  fields: {
    title: { kind: "text", label: "Heading", max: 28 },
    description: { kind: "text", label: "Text", max: 134 },
    button: { kind: "text", label: "Button (opens Find my solution)", max: 20 },
  },
  defaults: {
    title: "Articles are on the way",
    description: "We’re writing our first guides on purified water. Meanwhile, find the system that suits you in three questions.",
    button: "Find my solution",
  },
});

export const blocks: AnyBlock[] = [blogSeo, blogHero, blogEmpty];
