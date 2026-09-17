import Image from "next/image";
import Link from "next/link";
import { Pill } from "@/components/ui/pill";
import { productRentalFrom, productTypeLabel, type Product } from "@/content/products";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

/** Catalogue card: whole card links to the product; Buy and Rent sit side by side (brief §5). */
export function ProductCard({
  product,
  className,
  sizes = "(min-width: 1024px) 330px, 80vw",
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const rent = productRentalFrom(product);

  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col rounded-card-xl bg-frost p-2.5 transition-colors duration-300 hover:bg-ice",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-card bg-white">
        <span
          aria-hidden
          className="absolute top-[56%] left-1/2 size-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pastel transition-transform duration-500 ease-emph group-hover/card:scale-105"
        />
        <Image
          src={product.image}
          alt={`${product.name}, ${product.tagline.toLowerCase()}`}
          fill
          sizes={sizes}
          className="object-contain px-10 py-7 transition-transform duration-500 ease-emph group-hover/card:-translate-y-1"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Pill>{productTypeLabel(product.types[0])}</Pill>
          {product.filtration.length > 0 && <Pill>{product.purification}</Pill>}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
        <h3 className="text-h3 font-medium text-ink">
          <Link href={`/water-purifiers/${product.slug}`} className="after:absolute after:inset-0 after:rounded-card-xl">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{product.tagline}</p>

        <div className="relative z-10 mt-auto grid grid-cols-2 gap-2 pt-6">
          <Link
            href={`/contact?type=buy&model=${product.slug}`}
            className="rounded-2xl bg-white px-4 py-3 transition-colors hover:bg-pastel"
          >
            <span className="block text-xs text-muted">Buy</span>
            <span className="block text-sm font-medium text-ink">
              {product.purchasePrice ? `${formatLKR(product.purchasePrice)} + VAT` : "Get a price"}
            </span>
          </Link>
          <Link
            href={`/contact?type=rental&preferredMachine=${product.slug}`}
            className="rounded-2xl bg-white px-4 py-3 transition-colors hover:bg-pastel"
          >
            <span className="block text-xs text-muted">{rent ? "Rent from" : "Rent"}</span>
            <span className="block text-sm font-medium text-ink">
              {rent ? (
                <>
                  {formatLKR(rent)}/mo <span className="text-xs font-normal text-muted">+ VAT</span>
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
