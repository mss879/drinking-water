import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Droplets, Plus } from "lucide-react";
import { createProduct, moveProduct, setProductPublished } from "@/app/actions/admin/website";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState, PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { RowActions } from "@/components/admin/website/row-actions";
import { Button } from "@/components/ui/button";
import { productTypeLabel } from "@/content/products";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { parseVariants, PRODUCT_PLACEHOLDER } from "@/lib/cms/map";
import { isSiteImage } from "@/lib/cms/media";
import { formatLKR } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

/** "UF LKR 85,000 · RO on request" — the buy prices at a glance. */
function priceLine(variants: ReturnType<typeof parseVariants>, key: "price" | "rent") {
  if (!variants.length) return "No options yet";
  return variants.map((variant) => `${variant.filtration} ${variant[key] ? formatLKR(variant[key]) : "on request"}`).join(" · ");
}

export default async function ProductsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: products, error } = await supabase.from("cms_products").select("*").order("position").order("name");

  return (
    <>
      <PageHeader
        title="Products"
        description="The water purifiers on the website. Change the order with the arrows, hide a product with the eye, or open one to change its photo, prices and text."
        actions={
          !error && (
            <form action={createProduct}>
              <Button type="submit" size="sm">
                <Plus aria-hidden className="size-4" /> New product
              </Button>
            </form>
          )
        }
      />

      {error ? (
        isMissingSchema(error) ? (
          <MigrationNotice />
        ) : (
          <p className="card-line p-6 text-muted">The products couldn’t be loaded: {error.message}</p>
        )
      ) : products.length === 0 ? (
        <div className="card-line">
          <EmptyState icon={<Droplets aria-hidden />} title="No products yet">
            Add the first one with New product.
          </EmptyState>
        </div>
      ) : (
        <ul className="grid gap-3">
          {products.map((product, i) => {
            const variants = parseVariants(product.variants);
            const image = product.image_url && isSiteImage(product.image_url) ? product.image_url : PRODUCT_PLACEHOLDER;
            return (
              <li key={product.id} className="card-line flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <Link href={`/admin/products/${product.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-card-sm bg-tint-2 sm:size-20">
                    <Image src={image} alt="" fill sizes="80px" className="object-contain p-1.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-bold text-ink group-hover:text-deep">{product.name}</span>
                      {product.published ? <Badge tone="solid">On the website</Badge> : <Badge tone="muted">Hidden</Badge>}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {product.types.length ? product.types.map((type) => productTypeLabel(type as never)).join(" · ") : "No category"}
                      {product.tagline && ` · ${product.tagline}`}
                    </span>
                    <span className="mt-1 block text-[13px] text-ink">
                      Buy: {priceLine(variants, "price")} <span className="text-muted">|</span> Rent: {priceLine(variants, "rent")}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden className="hidden size-4 shrink-0 text-deep sm:block" />
                </Link>
                <RowActions
                  name={product.name}
                  published={product.published}
                  first={i === 0}
                  last={i === products.length - 1}
                  onMove={moveProduct.bind(null, product.id)}
                  onPublish={setProductPublished.bind(null, product.id)}
                  className="sm:shrink-0"
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
