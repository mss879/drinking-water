import { ogCard } from "./card";

export const dynamic = "force-static";

/** Shared social card, referenced by every page's metadata (lib/seo.ts). */
export function GET() {
  return ogCard({
    lead: "Pure water",
    rest: "without the hassle",
    text: "Water purification and hydration solutions for homes, offices and businesses in Sri Lanka.",
    footer: "BUY • RENT • HYDRATE • CARE",
  });
}
