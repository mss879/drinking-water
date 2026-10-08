"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, Trash2, X } from "lucide-react";
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
import { site } from "@/content/site";
import { parseCards, parseQuestions, parseSpecs, parseVariants } from "@/lib/cms/map";
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
    ...(hasExtras(row)
      ? { specs: parseSpecs(row.specs), faqs: parseQuestions(row.faqs), seo_title: row.seo_title ?? "", seo_description: row.seo_description ?? "" }
      : {}),
  };
}

/** Whether the database has the extra specifications, questions and search text yet (the October 9 migration). */
const hasExtras = (row: ProductRow) => "specs" in row;

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

const listButton = cn(removeButton, "disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent");

const textLink = "font-semibold text-deep underline-offset-2 hover:underline";

type Pair = { first: string; second: string };

function swap<T>(list: T[], from: number, to: number) {
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** Two-part rows (a specification's name and value, a question and its answer): edit, reorder, add, remove. */
function PairListEditor({
  label,
  items,
  onChange,
  max,
  addLabel,
  first,
  second,
}: {
  label: string;
  items: Pair[];
  onChange: (items: Pair[]) => void;
  max: number;
  addLabel: string;
  first: { name: string; placeholder: string; max: number };
  second: { name: string; placeholder: string; max: number; multiline?: boolean };
}) {
  const update = (i: number, patch: Partial<Pair>) => onChange(items.map((item, j) => (j === i ? { ...item, ...patch } : item)));
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {items.length > 0 && (
        <ol className="grid gap-3">
          {items.map((item, i) => (
            <li key={i} className="grid gap-2 rounded-card-sm border border-line bg-white p-3">
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-tint-2 text-xs font-bold text-deep">
                  {i + 1}
                </span>
                <Input
                  value={item.first}
                  maxLength={first.max}
                  placeholder={first.placeholder}
                  aria-label={`${label} ${i + 1}: ${first.name.toLowerCase()}`}
                  onChange={(event) => update(i, { first: event.target.value })}
                />
                <button type="button" className={listButton} aria-label="Move up" disabled={i === 0} onClick={() => onChange(swap(items, i, i - 1))}>
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  className={listButton}
                  aria-label="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => onChange(swap(items, i, i + 1))}
                >
                  <ArrowDown aria-hidden className="size-4" />
                </button>
                <button type="button" className={listButton} aria-label={`Remove ${item.first || first.name.toLowerCase()}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  <X aria-hidden className="size-4" />
                </button>
              </div>
              {second.multiline ? (
                <Textarea
                  value={item.second}
                  maxLength={second.max}
                  placeholder={second.placeholder}
                  aria-label={`${label} ${i + 1}: ${second.name.toLowerCase()}`}
                  rows={3}
                  className="min-h-20"
                  onChange={(event) => update(i, { second: event.target.value })}
                />
              ) : (
                <Input
                  value={item.second}
                  maxLength={second.max}
                  placeholder={second.placeholder}
                  aria-label={`${label} ${i + 1}: ${second.name.toLowerCase()}`}
                  onChange={(event) => update(i, { second: event.target.value })}
                />
              )}
            </li>
          ))}
        </ol>
      )}
      {items.length < max && (
        <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => onChange([...items, { first: "", second: "" }])}>
          <Plus aria-hidden className="size-4" /> {addLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Editing one product: everything its card and page show, from the client's "Buy UF, RO & rental" request (one row per
 * purification option, each with its own model number) to its extra rows and search text. Each option's prices are set
 * in Prices & quotes.
 */
export function ProductEditor({ product, sharedMaintenanceNote = maintenanceNote }: { product: ProductRow; sharedMaintenanceNote?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(() => formFrom(product));
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const slugTouched = !product.slug.startsWith("new-product-");
  const extras = hasExtras(product);
  // What Google and shared links show; empty fields fall back to the name, tagline and summary, as on the website.
  const defaultTitle = `${form.name} – ${form.tagline}`;
  const searchTitle = form.seo_title?.trim() || defaultTitle;
  const searchDescription = form.seo_description?.trim() || form.summary;
  const shownTitle = `${searchTitle} | ${site.name}`.length > 60 ? searchTitle : `${searchTitle} | ${site.name}`;

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

          <Panel title="Purification options" description="One row per option the customer can choose.">
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
                    set("variants", [...form.variants, { filtration, label: `4-Stage ${filtration}`, code: "" }]);
                  }}
                >
                  <Plus aria-hidden className="size-4" /> Add an option
                </Button>
              )}
              <p className="text-sm text-muted">
                Each option’s buy and rent-from prices are set in{" "}
                <Link href="/admin/pricing" className={textLink}>
                  Prices &amp; quotes
                </Link>
                . While a price is hidden, the website asks for a quote instead.
              </p>
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
                <Textarea id="p-mn" value={form.maintenance_note} placeholder={sharedMaintenanceNote} onChange={(event) => set("maintenance_note", event.target.value)} />
              </Field>
            </div>
          </Panel>

          {extras ? (
            <>
              <Panel
                title="Extra specifications"
                description="Rows added to the product page’s specifications, after the standard ones (model, category, purification, water, installation and warranty). Up to 10."
              >
                <PairListEditor
                  label="Extra specification"
                  items={(form.specs ?? []).map((spec) => ({ first: spec.label, second: spec.value }))}
                  onChange={(items) => set("specs", items.map((item) => ({ label: item.first, value: item.second })))}
                  max={10}
                  addLabel="Add a specification"
                  first={{ name: "Name", placeholder: "Name, for example Tank capacity", max: 40 }}
                  second={{ name: "Value", placeholder: "Value, for example 5 litres", max: 200 }}
                />
              </Panel>

              <Panel
                title="Extra questions"
                description="Questions added to the product page, after the standard ones (UF or RO, renting, installation, maintenance and warranty). Up to 6."
              >
                <PairListEditor
                  label="Extra question"
                  items={(form.faqs ?? []).map((faq) => ({ first: faq.q, second: faq.a }))}
                  onChange={(items) => set("faqs", items.map((item) => ({ q: item.first, a: item.second })))}
                  max={6}
                  addLabel="Add a question"
                  first={{ name: "Question", placeholder: "Question", max: 200 }}
                  second={{ name: "Answer", placeholder: "Answer, as one paragraph", max: 1200, multiline: true }}
                />
              </Panel>
            </>
          ) : (
            <Panel title="Extra specifications, questions and search text">
              <p className="text-sm text-muted">
                Run <code className="rounded bg-tint px-1.5 py-0.5 text-[13px] text-deep">supabase/migrations/20261009120000_editable_website.sql</code> in the
                Supabase SQL editor to add extra specification rows, extra questions and this product’s own search title and description.
              </p>
            </Panel>
          )}
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

          {extras && (
            <Panel title="Search & sharing" description="The title and description Google and shared links show for this product’s page.">
              <div className="grid gap-4">
                <div className="rounded-chip border border-line p-3.5">
                  <p className="truncate text-[12px] text-muted">
                    {site.url.replace(/^https?:\/\//, "")} › water-purifiers › {form.slug || "…"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[17px] text-deep">{shownTitle}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted">{searchDescription}</p>
                </div>
                <Field label="Search title" htmlFor="p-seo-title" hint={`${(form.seo_title ?? "").trim().length}/70 · leave empty to use the name and tagline`}>
                  <Input id="p-seo-title" maxLength={70} placeholder={defaultTitle} value={form.seo_title ?? ""} onChange={(event) => set("seo_title", event.target.value)} />
                </Field>
                <Field label="Search description" htmlFor="p-seo-description" hint={`${(form.seo_description ?? "").trim().length}/170 · leave empty to use the summary`}>
                  <Textarea
                    id="p-seo-description"
                    maxLength={170}
                    placeholder={form.summary}
                    value={form.seo_description ?? ""}
                    className="min-h-24"
                    onChange={(event) => set("seo_description", event.target.value)}
                  />
                </Field>
              </div>
            </Panel>
          )}

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
