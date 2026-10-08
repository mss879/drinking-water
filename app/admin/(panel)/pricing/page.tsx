import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/panel";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { PricingForm, type PricingProduct } from "@/components/admin/website/pricing-form";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { getRentalPlans } from "@/lib/cms/content";
import { parseVariants, pricingFrom } from "@/lib/cms/map";

export const metadata: Metadata = { title: "Prices & quotes" };

export default async function PricingAdminPage() {
  const { supabase } = await requireAdmin();
  const [products, prices, settings, plans] = await Promise.all([
    supabase.from("cms_products").select("id, name, slug, published, variants").order("position").order("name"),
    supabase.from("cms_prices").select("product_id, item, amount, visible"),
    supabase.from("cms_settings").select("value").eq("key", "pricing").maybeSingle(),
    getRentalPlans(),
  ]);
  const missing = [products.error, prices.error, settings.error].find((error) => error && isMissingSchema(error));
  const failed = [products.error, prices.error, settings.error].find(Boolean);

  const list: PricingProduct[] = (products.data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    published: product.published,
    options: parseVariants(product.variants).map((variant) => ({ filtration: variant.filtration, label: variant.label, code: variant.code })),
  }));

  return (
    <>
      <PageHeader
        title="Prices & quotes"
        description="Every price the website can show, each with its own switch. While a price is hidden the website asks for a quote instead, so you can enter prices now and show them when you’re ready. AMC plan prices and part prices have their own sections."
      />
      {missing ? (
        <MigrationNotice migration="20261009120000_editable_website.sql" />
      ) : failed ? (
        <p className="card-line p-6 text-muted">The prices couldn’t be loaded: {failed.message}</p>
      ) : (
        <PricingForm
          products={list}
          prices={prices.data ?? []}
          settings={pricingFrom(settings.data?.value)}
          planNames={Object.fromEntries(plans.map((plan) => [plan.id, plan.name]))}
        />
      )}
    </>
  );
}
