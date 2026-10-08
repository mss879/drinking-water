"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { savePicks } from "@/app/actions/admin/picks";
import { Field, Select } from "@/components/admin/ui/field";
import { Panel } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import type { Picks } from "@/content/products";

export type PickProduct = { slug: string; name: string; published: boolean };

/** Find my solution's three kinds of space, as the form names them. */
const needs: { id: keyof Picks["finder"]; label: string; hint: string }[] = [
  { id: "home", label: "Find my solution: Home", hint: "Recommended when someone chooses Home." },
  { id: "office", label: "Find my solution: Office", hint: "Recommended when someone chooses Office." },
  { id: "commercial", label: "Find my solution: Commercial", hint: "Factories, hotels, schools or several sites." },
];

const AUTOMATIC = "";

/** The products to choose from: those on the website, plus the current choice if it has since been hidden. */
function Options({ products, current }: { products: PickProduct[]; current: string }) {
  const missing = current !== "" && !products.some((product) => product.slug === current && product.published);
  const hidden = products.find((product) => product.slug === current && !product.published);
  return (
    <>
      {missing && <option value={current}>{hidden ? `${hidden.name} (hidden from the website)` : `${current} (no longer exists)`}</option>}
      {products
        .filter((product) => product.published)
        .map((product) => (
          <option key={product.slug} value={product.slug}>
            {product.name}
          </option>
        ))}
    </>
  );
}

/** Which purifier Find my solution recommends for each kind of space, and the one on the home page's Buy card. */
export function PicksForm({ picks, products }: { picks: Picks; products: PickProduct[] }) {
  const router = useRouter();
  const [form, setForm] = useState(picks);
  const [pending, startTransition] = useTransition();

  return (
    <Panel
      title="Recommended products"
      description="Which purifier Find my solution recommends for each kind of space, and which one the home page’s Buy card features."
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await savePicks(form);
            if (!result.ok) return toast(result.error, "error");
            toast(result.message ?? "Saved.");
            router.refresh();
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {needs.map((need) => (
            <Field key={need.id} label={need.label} htmlFor={`pick-${need.id}`} hint={need.hint}>
              <Select
                id={`pick-${need.id}`}
                value={form.finder[need.id]}
                onChange={(event) => setForm((current) => ({ ...current, finder: { ...current.finder, [need.id]: event.target.value } }))}
              >
                <Options products={products} current={form.finder[need.id]} />
              </Select>
            </Field>
          ))}
          <Field label="Home page: Buy card" htmlFor="pick-buy" hint="The purifier pictured on the home page’s Buy card.">
            <Select
              id="pick-buy"
              value={form.homeBuyCard ?? AUTOMATIC}
              onChange={(event) => setForm((current) => ({ ...current, homeBuyCard: event.target.value || null }))}
            >
              <option value={AUTOMATIC}>First countertop purifier (automatic)</option>
              <Options products={products} current={form.homeBuyCard ?? AUTOMATIC} />
            </Select>
          </Field>
        </div>
        <div>
          <Button type="submit" loading={pending}>
            Save recommended products
          </Button>
        </div>
      </form>
    </Panel>
  );
}
