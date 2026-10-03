import { notFound } from "next/navigation";
import { productTypeLabel } from "@/content/products";
import { getProduct, getProducts } from "@/lib/cms/content";
import { ogCard } from "../../card";

/** Built with the site, and again whenever the admin saves a product (the catalogue is cached under the cms tag). */
export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

/** Each product's social card: its name and tagline on the brand card, so a shared link says what it is. */
export async function GET(_request: Request, { params }: RouteContext<"/og/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  return ogCard({
    lead: product.name,
    rest: product.tagline,
    text: `${product.purification} · ${product.temperatures.join(" · ")} · Installed and cared for by LUSAKO`,
    layout: "product",
    footer: product.types[0] ? `${productTypeLabel(product.types[0]).toUpperCase()} • WATER PURIFIERS` : "WATER PURIFIERS",
  });
}
