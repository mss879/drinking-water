import { chromeSite } from "@/content/copy/chrome";
import { getCopy } from "@/lib/cms/content";
import { ogCard } from "./card";

/** Built with the site, and again whenever the admin saves page text (the text is cached under the cms tag). */
export const dynamic = "force-static";

/** Shared social card, referenced by every page's metadata (lib/seo.ts). Its text is Page text › Search & sharing. */
export async function GET() {
  const copy = await getCopy(chromeSite);
  return ogCard({ lead: copy.cardLead, rest: copy.cardRest, text: copy.cardText, footer: copy.cardFooter });
}
