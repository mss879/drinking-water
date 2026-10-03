import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/panel";
import { buttonClasses } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { websiteSections } from "@/lib/admin/website-sections";

export const metadata: Metadata = { title: "Website" };

/** The Website group in one place (the phone tab bar's "Website" tab lands here), with what each section holds. */
export default async function WebsiteHubPage() {
  const { supabase } = await requireAdmin();
  const count = async (table: "cms_products" | "cms_parts" | "cms_client_logos" | "blog_posts") => {
    const { count: total, error } = await supabase.from(table).select("id", { count: "exact", head: true });
    return error ? null : (total ?? 0);
  };
  const [products, parts, logos, posts] = await Promise.all([count("cms_products"), count("cms_parts"), count("cms_client_logos"), count("blog_posts")]);
  const totals: Record<string, string | null> = {
    "/admin/products": products === null ? null : `${products} ${products === 1 ? "product" : "products"}`,
    "/admin/parts": parts === null ? null : `${parts} ${parts === 1 ? "item" : "items"}`,
    "/admin/logos": logos === null ? null : `${logos} ${logos === 1 ? "logo" : "logos"}`,
    "/admin/blog": posts === null ? null : `${posts} ${posts === 1 ? "post" : "posts"}`,
  };

  return (
    <>
      <PageHeader
        title="Website"
        description="Everything you can change on drinkingwater.lk yourself. Saved changes appear on the website straight away."
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
            <ExternalLink aria-hidden className="size-4" /> View website
          </a>
        }
      />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {websiteSections.map(({ href, label, description, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="group card-line flex h-full flex-col gap-4 p-5 transition-colors hover:border-brand hover:bg-tint sm:p-6">
              <span className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-tint-2 text-deep">
                  <Icon aria-hidden className="size-5" />
                </span>
                <ArrowUpRight aria-hidden className="size-4 text-deep transition-transform group-hover:rotate-45" />
              </span>
              <span>
                <span className="block font-display text-lg font-bold text-ink">{label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{description}</span>
              </span>
              {totals[href] && <span className="mt-auto text-[13px] font-semibold text-deep">{totals[href]}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
