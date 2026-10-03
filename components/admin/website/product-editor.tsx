"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { deleteProduct, saveProduct, type ProductInput } from "@/app/actions/admin/website";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/field";
import { Panel } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { ImageField } from "@/components/admin/website/image-field";
import { CardListEditor, TextListEditor } from "@/components/admin/website/list-editors";
import { Button, buttonClasses } from "@/components/ui/button";
import { maintenanceNote, productTypes } from "@/content/products";
import { parseCards, parseVariants } from "@/lib/cms/map";
import { cn } from "@/lib/cn";
import type { ProductRow } from "@/lib/supabase/types";

type Variant = ProductInput["variants"][number];

function formFrom(row: ProductRow): ProductInput {
  return {
    name: row.name,
    slug: row.slug,
    family: row.family,
    tagline: row.tagline,
    types: row.types,
    variants: parseVariants(row.variants).map((variant) => ({
      filtration: variant.filtration,
      label: variant.label,
      code: variant.code ?? "",
      price: variant.price ? String(variant.price) : "",
      rent: variant.rent ? String(variant.rent) : "",
    })),
    purification: row.purification,
    temperatures: row.temperatures,
    installation: row.installation,
    warranty: row.warranty,
    image_url: row.image_url,
    summary: row.summary,
    highlights: row.highlights,
    features: parseCards(row.features),
    who_for: parseCards(row.who_for),
    filtration_note: row.filtration_note,
    installation_note: row.installation_note,
    maintenance_note: row.maintenance_note ?? "",
    published: row.published,
  };
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const removeButton =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-tint hover:text-ink";

/**
 * Editing one product: everything its card and page show. The prices section is the client's "Buy UF, RO & rental"
 * request: one row per purification option, each with its own model number, buy price and rental-from price.
 */
export function ProductEditor({ product }: { product: ProductRow }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(() => formFrom(product));
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const slugTouched = !product.slug.startsWith("new-product-");

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }
  const setVariant = (i: number, patch: Partial<Variant>) =>
    set(
      "variants",
      form.variants.map((variant, j) => (j === i ? { ...variant, ...patch } : variant)),
    );

  function toggleType(type: string, on: boolean) {
    set("types", on ? [...form.types, type] : form.types.filter((item) => item !== type));
  }

  function save(published = form.published) {
    startTransition(async () => {
      const result = await saveProduct(product.id, { ...form, published });
      if (!result.ok) {
        toast(result.error, "error");
        return;
      }
      setForm((current) => ({ ...current, published }));
      setDirty(false);
      toast(result.message ?? "Saved.");
      router.refresh();
    });
  }

  function remove() {
    startDeleting(async () => {
      const result = await deleteProduct(product.id);
      if (!result.ok) {
        toast(result.error, "error");
        return;
      }
      toast(result.message ?? "Deleted.");
      router.push("/admin/products");
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-deep">
            <ArrowLeft aria-hidden className="size-4" /> Products
          </Link>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 font-display text-[length:clamp(1.6rem,1.3rem+1vw,2.1rem)] leading-tight font-bold text-ink">
            {form.name || "Untitled product"}
            {form.published ? <Badge tone="solid">On the website</Badge> : <Badge tone="muted">Hidden</Badge>}
            {dirty && <Badge tone="soft">Unsaved changes</Badge>}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.published && (
            <a href={`/water-purifiers/${product.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
              <ExternalLink aria-hidden className="size-4" /> View on website
            </a>
          )}
          {form.published ? (
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => save(false)}>
              Hide from website
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => save(true)}>
              Save &amp; publish
            </Button>
          )}
          <Button type="submit" size="sm" loading={pending}>
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="grid min-w-0 gap-5">
          <Panel title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="p-name">
                <Input
                  id="p-name"
                  required
                  value={form.name}
                  onChange={(event) => {
                    set("name", event.target.value);
                    if (!slugTouched && !product.published) set("slug", slugify(event.target.value));
                  }}
                />
              </Field>
              <Field label="Web address" htmlFor="p-slug" hint={`drinkingwater.lk/water-purifiers/${form.slug || "…"}`}>
                <Input id="p-slug" value={form.slug} onChange={(event) => set("slug", slugify(event.target.value))} />
              </Field>
              <Field label="Product family" htmlFor="p-family" hint="For example AquaElite. Shown on the About page.">
                <Input id="p-family" value={form.family} onChange={(event) => set("family", event.target.value)} />
              </Field>
              <Field label="Tagline" htmlFor="p-tagline" hint="For example Premium Countertop Water Purifier.">
                <Input id="p-tagline" value={form.tagline} onChange={(event) => set("tagline", event.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Purification options and prices"
            description="One row per option the customer can choose. Prices are in LKR, excluding VAT. Leave a price empty to show “Price on request”."
          >
            <div className="grid gap-3">
              {form.variants.map((variant, i) => (
                <fieldset key={i} className="grid gap-3 rounded-card-sm border border-line bg-tint/60 p-3 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                  <legend className="sr-only">Option {i + 1}</legend>
                  <Field label="Purification" htmlFor={`v-${i}-f`}>
                    <Select id={`v-${i}-f`} value={variant.filtration} onChange={(event) => setVariant(i, { filtration: event.target.value })}>
                      <option value="UF">UF</option>
                      <option value="RO">RO</option>
                    </Select>
                  </Field>
                  <Field label="Name on the website" htmlFor={`v-${i}-l`}>
                    <Input id={`v-${i}-l`} value={variant.label} placeholder={`4-Stage ${variant.filtration}`} onChange={(event) => setVariant(i, { label: event.target.value })} />
                  </Field>
                  <Field label="Model number" htmlFor={`v-${i}-c`}>
                    <Input id={`v-${i}-c`} value={variant.code} placeholder="Optional" onChange={(event) => setVariant(i, { code: event.target.value })} />
                  </Field>
                  <button
                    type="button"
                    className={cn(removeButton, "hidden sm:mb-1 sm:grid")}
                    aria-label={`Remove the ${variant.label || variant.filtration} option`}
                    onClick={() => set("variants", form.variants.filter((_, j) => j !== i))}
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                  <Field label="Buy price (LKR)" htmlFor={`v-${i}-p`} className="sm:col-span-2">
                    <Input id={`v-${i}-p`} inputMode="numeric" value={variant.price} placeholder="Price on request" onChange={(event) => setVariant(i, { price: event.target.value })} />
                  </Field>
                  <Field label="Rent from (LKR / month)" htmlFor={`v-${i}-r`} className="sm:col-span-2">
                    <Input id={`v-${i}-r`} inputMode="numeric" value={variant.rent} placeholder="Rental on request" onChange={(event) => setVariant(i, { rent: event.target.value })} />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit sm:hidden"
                    onClick={() => set("variants", form.variants.filter((_, j) => j !== i))}
                  >
                    <X aria-hidden className="size-4" /> Remove this option
                  </Button>
                </fieldset>
              ))}
              {form.variants.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    const filtration = form.variants.some((variant) => variant.filtration === "UF") ? "RO" : "UF";
                    set("variants", [...form.variants, { filtration, label: `4-Stage ${filtration}`, code: "", price: "", rent: "" }]);
                  }}
                >
                  <Plus aria-hidden className="size-4" /> Add an option
                </Button>
              )}
            </div>
          </Panel>

          <Panel title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Purification, as shown on cards" htmlFor="p-pur" hint="For example UF / RO.">
                <Input id="p-pur" value={form.purification} onChange={(event) => set("purification", event.target.value)} />
              </Field>
              <Field label="Warranty" htmlFor="p-war" hint="For example 2 years.">
                <Input id="p-war" value={form.warranty} onChange={(event) => set("warranty", event.target.value)} />
              </Field>
              <Field label="Installation" htmlFor="p-inst" hint="For example Professional installation.">
                <Input id="p-inst" value={form.installation} onChange={(event) => set("installation", event.target.value)} />
              </Field>
              <TextListEditor
                label="Water temperatures"
                items={form.temperatures}
                onChange={(items) => set("temperatures", items)}
                placeholder="Hot"
                max={6}
                addLabel="Add a temperature"
              />
            </div>
          </Panel>

          <Panel title="Product page" description="The text on the product’s own page.">
            <div className="grid gap-5">
              <Field label="Summary" htmlFor="p-sum" hint="One or two sentences under the product name.">
                <Textarea id="p-sum" value={form.summary} onChange={(event) => set("summary", event.target.value)} />
              </Field>
              <TextListEditor
                label="Highlights"
                items={form.highlights}
                onChange={(items) => set("highlights", items)}
                placeholder="Hot · Normal · Cold"
                max={6}
                addLabel="Add a highlight"
                hint="Short tags beside “Why choose” on the product page."
              />
              <CardListEditor label="Features" items={form.features} onChange={(items) => set("features", items)} max={8} addLabel="Add a feature" />
              <CardListEditor label="Who it’s for" items={form.who_for} onChange={(items) => set("who_for", items)} max={6} addLabel="Add an audience" />
              <Field label="Filtration note" htmlFor="p-fn" hint="Which model suits which water.">
                <Textarea id="p-fn" value={form.filtration_note} onChange={(event) => set("filtration_note", event.target.value)} />
              </Field>
              <Field label="Installation note" htmlFor="p-in">
                <Textarea id="p-in" value={form.installation_note} onChange={(event) => set("installation_note", event.target.value)} />
              </Field>
              <Field label="Maintenance note" htmlFor="p-mn" hint="Leave empty to use the standard LUSAKO Care text.">
                <Textarea id="p-mn" value={form.maintenance_note} placeholder={maintenanceNote} onChange={(event) => set("maintenance_note", event.target.value)} />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="grid min-w-0 gap-5 lg:sticky lg:top-6">
          <Panel title="Photo">
            <ImageField
              label="Product photo"
              value={form.image_url}
              onChange={(url) => set("image_url", url)}
              folder="products"
              owner={product.id}
              aspect="aspect-square"
              hint="A cut-out product shot on a plain background looks best. JPG, PNG or WebP."
            />
          </Panel>

          <Panel title="Categories" description="Where the product appears in the catalogue filter.">
            <ul className="grid gap-2">
              {productTypes.map((type) => {
                const checked = form.types.includes(type.id);
                return (
                  <li key={type.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-chip px-2 py-1.5 text-[15px] text-ink hover:bg-tint">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => toggleType(type.id, event.target.checked)}
                        className="size-4 accent-[var(--color-deep)]"
                      />
                      {type.label}
                    </label>
                  </li>
                );
              })}
            </ul>
            {form.types.length > 1 && (
              <Field label="Shown on the product card as" htmlFor="p-primary" className="mt-4">
                <Select
                  id="p-primary"
                  value={form.types[0]}
                  onChange={(event) => set("types", [event.target.value, ...form.types.filter((type) => type !== event.target.value)])}
                >
                  {form.types.map((type) => (
                    <option key={type} value={type}>
                      {productTypes.find((item) => item.id === type)?.label ?? type}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </Panel>

          <Panel title="Delete">
            <p className="text-sm text-muted">Removes the product and its page from the website. To take it down for a while, hide it instead.</p>
            <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden className="size-4" /> Delete product
            </Button>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        pending={deleting}
        title={`Delete ${form.name || "this product"}?`}
        description="Its page and photos are removed for good. This can’t be undone."
      />
    </form>
  );
}
