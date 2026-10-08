import { notFound } from "next/navigation";
import { productShareCard } from "@/content/copy/product";
import { fill } from "@/content/copy/schema";
import { productTypeLabel } from "@/content/products";
import { getCopy, getProduct, getProducts } from "@/lib/cms/content";
import { ogCard } from "../../card";

/**
 * Built with the site, and again whenever the admin saves a product or the card's wording (both are cached under the
 * cms tag).
 */
export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

/**
 * Each product's social card: its name and tagline on the brand card, so a shared link says what it is. The line under
 * them and the footer are Page text (product.shareCard).
 */
export async function GET(_request: Request, { params }: RouteContext<"/og/products/[slug]">) {
  const [product, copy] = await Promise.all([getProduct((await params).slug), getCopy(productShareCard)]);
  if (!product) notFound();
  const footer = copy.footer.toUpperCase();
  return ogCard({
    lead: product.name,
    rest: product.tagline,
    text: fill(copy.text, { purification: product.purification, temperatures: product.temperatures.join(" · ") }),
    layout: "product",
    footer: product.types[0] ? `${productTypeLabel(product.types[0]).toUpperCase()} • ${footer}` : footer,
  });
}
