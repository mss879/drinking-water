import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MigrationNotice } from "@/components/admin/website/migration-notice";
import { ProductEditor } from "@/components/admin/website/product-editor";
import { productCare } from "@/content/copy/product";
import { isMissingSchema, requireAdmin } from "@/lib/admin/auth";
import { getCopy } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Edit product" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: product, error } = await supabase.from("cms_products").select("*").eq("id", id).maybeSingle();
  if (error && isMissingSchema(error)) return <MigrationNotice />;
  if (error) throw new Error(error.message);
  if (!product) notFound();
  // The shared maintenance note as Page text has it, shown as the placeholder for a product's own note.
  const { maintenanceNote } = await getCopy(productCare);
  return <ProductEditor key={product.updated_at} product={product} sharedMaintenanceNote={maintenanceNote} />;
}
