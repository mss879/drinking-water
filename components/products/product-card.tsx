import Image from "next/image";
import Link from "next/link";
import { WaveLines } from "@/components/ui/decor";
import { Pill } from "@/components/ui/pill";
import { productPriceFrom, productRentalFrom, productTypeLabel, type Product } from "@/content/products";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

/**
 * Catalogue card in the StomDent "doctor card" style: outlined, the product on a pale-blue panel, then Buy and
 * Rent side by side (brief §5). The whole card links to the product. `showPrices={false}` keeps prices off the
 * home page (client request); the catalogue and product pages show them.
 */
export function ProductCard({
  product,
  className,
  sizes = "(min-width: 1024px) 340px, 80vw",
  showPrices = true,
}: {
  product: Product;
  className?: string;
  sizes?: string;
  showPrices?: boolean;
}) {
  const price = productPriceFrom(product);
  const rent = productRentalFrom(product);
  const several = product.variants.length > 1;

  return (
    <article
      className={cn(
        "group/card card-line relative flex h-full flex-col p-2.5 transition-colors duration-300 hover:border-brand",
        className,
      )}
    >
      <div className="relative aspect-[4/3.5] overflow-hidden rounded-card-sm bg-tint-2">
        <WaveLines lines={3} drift={false} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand/40" />
        <Image
          src={product.image}
          alt={`${product.name}, ${product.tagline.toLowerCase()}`}
          fill
          sizes={sizes}
          className="object-contain px-10 pt-12 pb-5 transition-transform duration-700 ease-emph group-hover/card:-translate-y-1.5 group-hover/card:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Pill variant="white">{productTypeLabel(product.types[0])}</Pill>
          {product.purification && <Pill variant="white">{product.purification}</Pill>}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
        <h3 className="font-display text-h3 font-bold text-ink">
          <Link href={`/water-purifiers/${product.slug}`} className="after:absolute after:inset-0 after:rounded-card">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{product.tagline}</p>

        <div className="relative z-10 mt-auto grid grid-cols-2 gap-2 pt-6">
          <Link
            href={`/contact?type=buy&model=${product.slug}#quote`}
            className="rounded-card-sm bg-deep px-4 py-3 text-white transition-colors hover:bg-deep-hover"
          >
            <span className="block text-xs text-white">{showPrices && price && several ? "Buy from" : "Buy"}</span>
            <span className="block text-sm font-semibold">
              {!showPrices ? "Own this system" : price ? `${formatLKR(price)} + VAT` : "Get a price"}
            </span>
          </Link>
          <Link
            href={`/contact?type=rental&preferredMachine=${product.slug}#quote`}
            className="rounded-card-sm border border-line px-4 py-3 transition-colors hover:border-deep hover:bg-tint"
          >
            <span className="block text-xs text-muted">{showPrices && rent ? "Rent from" : "Rent"}</span>
            <span className="block text-sm font-semibold text-deep">
              {!showPrices ? (
                "Monthly plan"
              ) : rent ? (
                <>
                  {formatLKR(rent)}/mo <span className="text-xs font-normal whitespace-nowrap text-muted">+ VAT</span>
                </>
              ) : (
                "Ask about rental"
              )}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
