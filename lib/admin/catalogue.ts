import "server-only";
import { productOptions, type FieldOption } from "@/content/forms";
import { products as defaultProducts } from "@/content/products";
import type { requireAdmin } from "@/lib/admin/auth";

type Admin = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/**
 * Product names for labelling inquiries: every product in the admin, hidden ones included, then the built-in
 * catalogue for anything older, so a model picked on the website always shows by name.
 */
export async function adminCatalogue(supabase: Admin): Promise<FieldOption[]> {
  const { data } = await supabase.from("cms_products").select("slug, name");
  const known = new Map((data ?? []).map((row) => [row.slug, row.name]));
  for (const product of defaultProducts) if (!known.has(product.slug)) known.set(product.slug, product.name);
  return productOptions([...known].map(([slug, name]) => ({ slug, name })));
}
