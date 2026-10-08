import { blocks as home } from "./home";
import { blocks as purifiers } from "./purifiers";
import { blocks as product } from "./product";
import { blocks as functionalWater } from "./functionalWater";
import { blocks as rental } from "./rental";
import { blocks as hydration } from "./hydration";
import { blocks as corporate } from "./corporate";
import { blocks as service } from "./service";
import { blocks as amc } from "./amc";
import { blocks as parts } from "./parts";
import { blocks as why } from "./why";
import { blocks as about } from "./about";
import { blocks as clients } from "./clients";
import { blocks as faq } from "./faq";
import { blocks as contact } from "./contact";
import { blocks as finder } from "./finder";
import { blocks as blog } from "./blog";
import { blocks as shared } from "./shared";
import { blocks as chrome } from "./chrome";
import type { AnyBlock } from "./schema";

/**
 * Every page's editable text, in the order the admin's Page text section lists them. Each page module declares its
 * blocks (content/copy/schema.ts explains the format); a page reads one with getCopy() from lib/cms/content.ts.
 */
export type CopyPage = { id: string; label: string; path: string; description: string; blocks: AnyBlock[] };

export const copyPages: CopyPage[] = [
  { id: "home", label: "Home", path: "/", description: "The home page, from the video hero to the closing call to action.", blocks: home },
  { id: "purifiers", label: "Water purifiers", path: "/water-purifiers", description: "The catalogue page: its header, guidance cards, why-buy section and the UF/RO explainer.", blocks: purifiers },
  { id: "product", label: "Product pages", path: "/water-purifiers/aquaelite-3x", description: "The wording every product page shares. {name} is replaced with each product’s name.", blocks: product },
  { id: "functionalWater", label: "Functional water", path: "/functional-water", description: "Sparkling, hydrogen, alkaline and other functional water.", blocks: functionalWater },
  { id: "rental", label: "Rental", path: "/rental", description: "The office rental page, its rental plans, charges and quote builder.", blocks: rental },
  { id: "hydration", label: "Hydration solutions", path: "/hydration-solutions", description: "Buy, rent or corporate: the three ways to work with LUSAKO.", blocks: hydration },
  { id: "corporate", label: "Corporate hydration", path: "/hydration-solutions/corporate", description: "The corporate hydration page and its proposal form.", blocks: corporate },
  { id: "service", label: "Service & support", path: "/service-support", description: "LUSAKO Care: services, AMC teaser, parts, rental care and service requests.", blocks: service },
  { id: "amc", label: "AMC plans", path: "/service-support/amc", description: "The wording around the AMC plans. Prices, visits and discounts are in AMC plans.", blocks: amc },
  { id: "parts", label: "Filters, parts & accessories", path: "/service-support/parts", description: "The parts page wording. The parts themselves are in Parts & accessories.", blocks: parts },
  { id: "why", label: "Why LUSAKO", path: "/why-lusako", description: "Why LUSAKO: the proposition, pillars, trust points and next steps.", blocks: why },
  { id: "about", label: "About LUSAKO", path: "/about", description: "About LUSAKO: the introduction, promises and the brand family.", blocks: about },
  { id: "clients", label: "Our clients", path: "/clients", description: "The Our clients page wording. Logos and stories have their own sections.", blocks: clients },
  { id: "faq", label: "FAQs page", path: "/faq", description: "The FAQs page wording. The questions themselves are in FAQs.", blocks: faq },
  { id: "contact", label: "Contact", path: "/contact", description: "The contact page wording.", blocks: contact },
  { id: "finder", label: "Find my solution", path: "/find-my-solution", description: "The three-question finder: its questions, answers and recommendations.", blocks: finder },
  { id: "blog", label: "Blog", path: "/blog", description: "The blog index wording. Articles are written in Blog.", blocks: blog },
  { id: "shared", label: "Shared sections", path: "/", description: "Sections that appear on several pages: the closing call to action, the questions block, rental inclusions, how it works, buy vs rent and more.", blocks: shared },
  { id: "chrome", label: "Header, footer & contact panels", path: "/", description: "The navigation’s contact panel, the phone contact sheet, the bottom action bar and the footer.", blocks: chrome },
];

const byKey = new Map(copyPages.flatMap((page) => page.blocks.map((block) => [block.key, block] as const)));

/** The block saved under this key, if the website still has it. */
export function findBlock(key: string): AnyBlock | undefined {
  return byKey.get(key);
}

export function findPage(id: string): CopyPage | undefined {
  return copyPages.find((page) => page.id === id);
}
