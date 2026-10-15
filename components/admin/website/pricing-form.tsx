"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EyeOff } from "lucide-react";
import { hideAllPrices, savePricing, type PriceInput } from "@/app/actions/admin/pricing";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/field";
import { Panel } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import { provinces, rentalPlans, type Filtration, type PricingSettings } from "@/content/pricing";
import { cn } from "@/lib/cn";
import { formatLKR } from "@/lib/format";

export type PricingProduct = {
  id: string;
  name: string;
  slug: string;
  published: boolean;
  options: { filtration: Filtration; label: string; code: string | null }[];
};

type Row = { product_id: string | null; item: string; amount: number | null; visible: boolean };
type Entry = { amount: string; visible: boolean };

const keyOf = (productId: string | null, item: string) => `${productId ?? "site"}:${item}`;
const regionalProvinces = provinces.filter((province) => province.id !== "western");
const amountOf = (value: string) => {
  const number = Number(value.replace(/[,\s]/g, ""));
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
};

/** One price: the amount, its show switch, and what the website does with it. */
function PriceField({
  id,
  label,
  entry,
  onChange,
  suffix,
  hideSwitch = false,
}: {
  id: string;
  label: string;
  entry: Entry;
  onChange: (entry: Entry) => void;
  suffix?: string;
  hideSwitch?: boolean;
}) {
  const amount = amountOf(entry.amount);
  const invalid = entry.amount.trim() !== "" && amount === null;
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">LKR</span>
        <Input
          id={id}
          inputMode="numeric"
          placeholder="Not set"
          value={entry.amount}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange({ ...entry, amount: event.target.value })}
          className="max-w-36"
        />
        {suffix && <span className="text-sm whitespace-nowrap text-muted">{suffix}</span>}
      </div>
      {!hideSwitch && (
        <label className={cn("flex w-fit cursor-pointer items-center gap-2 text-[13px]", amount === null && "cursor-not-allowed opacity-60")}>
          <input
            type="checkbox"
            checked={entry.visible && amount !== null}
            disabled={amount === null}
            onChange={(event) => onChange({ ...entry, visible: event.target.checked })}
            className="size-4 accent-[var(--color-deep)]"
          />
          Show on the website
        </label>
      )}
      <p className="text-xs text-muted">
        {invalid
          ? "Enter the amount in rupees, like 4,990."
          : entry.visible && amount !== null
            ? `Shown as ${formatLKR(amount)}${suffix ?? ""}`
            : "Hidden: the website asks for a quote."}
      </p>
    </div>
  );
}

/**
 * The website's prices in one place: purifier options (buy and rent-from), rental plans and charges, the AMC on-call
 * fee, plus the KOKO badge and home-page switches. Each price is hidden until its switch is on.
 */
export function PricingForm({
  products,
  prices,
  settings,
  planNames = {},
}: {
  products: PricingProduct[];
  prices: Row[];
  settings: PricingSettings;
  /** The rental plans' names as Page text has them. */
  planNames?: Record<string, string>;
}) {
  const planName = (plan: (typeof rentalPlans)[number]) => planNames[plan.id] ?? plan.name;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmHide, setConfirmHide] = useState(false);
  const [options, setOptions] = useState(settings);
  const [entries, setEntries] = useState<Record<string, Entry>>(() =>
    Object.fromEntries(prices.map((row) => [keyOf(row.product_id, row.item), { amount: row.amount === null ? "" : String(row.amount), visible: row.visible }])),
  );
  const entry = (productId: string | null, item: string): Entry => entries[keyOf(productId, item)] ?? { amount: "", visible: false };
  const set = (productId: string | null, item: string) => (next: Entry) => setEntries((current) => ({ ...current, [keyOf(productId, item)]: next }));
  const shownCount = Object.values(entries).filter((value) => value.visible && amountOf(value.amount) !== null).length;

  function save() {
    const labels: Record<string, string> = {};
    for (const product of products) {
      for (const option of product.options) {
        const f = option.filtration.toLowerCase();
        labels[keyOf(product.id, `buy-${f}`)] = `${product.name} ${option.label}, buy price`;
        labels[keyOf(product.id, `rent-${f}`)] = `${product.name} ${option.label}, rent-from price`;
      }
    }
    for (const plan of rentalPlans) labels[keyOf(null, `rental-plan-${plan.id}`)] = `${planName(plan)} rental from-price`;
    labels[keyOf(null, "rental-initial")] = "Initial payment";
    labels[keyOf(null, "rental-regional")] = "Regional Hydration Service";
    for (const province of regionalProvinces) labels[keyOf(null, `rental-regional-${province.id}`)] = `Regional Hydration Service, ${province.label}`;
    labels[keyOf(null, "oncall-fee")] = "On-call visit fee";

    const regional = entry(null, "rental-regional");
    const list: PriceInput[] = Object.entries(entries)
      .filter(([key]) => key in labels)
      .map(([key, value]) => {
        const [owner, ...rest] = key.split(":");
        const item = rest.join(":");
        // Province charges follow the Regional Hydration Service's switch.
        const visible = item.startsWith("rental-regional-") ? regional.visible && amountOf(value.amount) !== null : value.visible;
        return { productId: owner === "site" ? null : owner, item, amount: value.amount, visible, label: labels[key] };
      });

    startTransition(async () => {
      const result = await savePricing({ settings: options, prices: list });
      if (!result.ok) return toast(result.error, "error");
      toast(result.message ?? "Saved.");
      router.refresh();
    });
  }

  function hideAll() {
    startTransition(async () => {
      const result = await hideAllPrices();
      if (!result.ok) return toast(result.error, "error");
      setEntries((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, { ...value, visible: false }])));
      setConfirmHide(false);
      toast(result.message ?? "Hidden.");
      router.refresh();
    });
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Panel
        title={
          <span className="flex flex-wrap items-center gap-2">
            On the website now
            {shownCount ? <Badge tone="solid">{shownCount} shown</Badge> : <Badge tone="muted">Every price hidden</Badge>}
          </span>
        }
        description="While a price is hidden, its button or card reads “Get a quote”."
        action={
          shownCount > 0 && (
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setConfirmHide(true)}>
              <EyeOff aria-hidden className="size-4" /> Hide every price
            </Button>
          )
        }
      >
        <div className="grid gap-3">
          <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink">
            <input
              type="checkbox"
              checked={options.koko}
              onChange={(event) => setOptions((current) => ({ ...current, koko: event.target.checked }))}
              className="mt-1 size-4 accent-[var(--color-deep)]"
            />
            <span>
              Show KOKO’s “Pay in instalments” badge on product pages
              <span className="block text-[13px] text-muted">Beside the Buy option.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink">
            <input
              type="checkbox"
              checked={options.showOnHome}
              onChange={(event) => setOptions((current) => ({ ...current, showOnHome: event.target.checked }))}
              className="mt-1 size-4 accent-[var(--color-deep)]"
            />
            <span>
              Also show prices on the home page’s product cards
              <span className="block text-[13px] text-muted">Off: the home page keeps “Get a quote” even when prices are shown elsewhere.</span>
            </span>
          </label>
        </div>
      </Panel>

      <Panel
        title="Water purifiers"
        description="A buy price and a monthly rent-from price for each purification option. They show on the product cards, the product page and in its structured data for Google."
      >
        {products.length === 0 ? (
          <p className="text-sm text-muted">
            No products yet. Add them in <Link href="/admin/products" className="font-semibold text-deep underline">Products</Link>.
          </p>
        ) : (
          <ul className="grid gap-4">
            {products.map((product) => (
              <li key={product.id} className="rounded-card-sm border border-line p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/products/${product.id}`} className="font-display text-[17px] font-bold text-ink hover:text-deep">
                    {product.name}
                  </Link>
                  {!product.published && <Badge tone="muted">Hidden product: its prices show once it’s on the website</Badge>}
                </div>
                {product.options.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">Add a UF or RO option to this product first.</p>
                ) : (
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    {product.options.map((option) => {
                      const f = option.filtration.toLowerCase();
                      return (
                        <div key={option.filtration} className="grid gap-4 rounded-card-sm bg-tint/60 p-3 sm:grid-cols-2">
                          <p className="text-[13px] font-semibold text-deep sm:col-span-2">
                            {option.label}
                            {option.code && <span className="font-normal text-muted"> · {option.code}</span>}
                          </p>
                          <PriceField id={`${product.id}-buy-${f}`} label="Buy price" entry={entry(product.id, `buy-${f}`)} onChange={set(product.id, `buy-${f}`)} suffix=" + VAT" />
                          <PriceField id={`${product.id}-rent-${f}`} label="Rent from" entry={entry(product.id, `rent-${f}`)} onChange={set(product.id, `rent-${f}`)} suffix="/month + VAT" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Rental"
        description="The rental plans’ from-prices and the rental charges. They show on the Rental page (plans, charges and the quote builder), Hydration solutions, Find my solution and Why LUSAKO. The questions in FAQs are written by hand, so mention an amount there yourself if you want it in an answer."
      >
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {rentalPlans.map((plan) => (
              <PriceField
                key={plan.id}
                id={`plan-${plan.id}`}
                label={`${planName(plan)} from`}
                entry={entry(null, `rental-plan-${plan.id}`)}
                onChange={set(null, `rental-plan-${plan.id}`)}
                suffix="/month"
              />
            ))}
          </div>
          <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <PriceField id="rental-initial" label="One-time initial payment (per unit)" entry={entry(null, "rental-initial")} onChange={set(null, "rental-initial")} />
            <PriceField
              id="rental-regional"
              label="Regional Hydration Service (per unit, outside the Western Province)"
              entry={entry(null, "rental-regional")}
              onChange={set(null, "rental-regional")}
              suffix="/month"
            />
          </div>
          <details className="rounded-card-sm border border-line p-4">
            <summary className="cursor-pointer text-[13px] font-semibold text-deep">A different Regional Hydration Service charge for a province (optional)</summary>
            <p className="mt-2 text-[13px] text-muted">Leave a province empty to use the charge above. These show and hide with it.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {regionalProvinces.map((province) => (
                <PriceField
                  key={province.id}
                  id={`regional-${province.id}`}
                  label={province.label}
                  entry={entry(null, `rental-regional-${province.id}`)}
                  onChange={set(null, `rental-regional-${province.id}`)}
                  suffix="/month"
                  hideSwitch
                />
              ))}
            </div>
          </details>
        </div>
      </Panel>

      <Panel title="Service" description="The on-call visit fee for customers without an AMC (shown in the AMC page’s on-call section).">
        <div className="grid gap-4 sm:grid-cols-2">
          <PriceField id="oncall-fee" label="On-call visit & inspection fee" entry={entry(null, "oncall-fee")} onChange={set(null, "oncall-fee")} />
          <p className="self-center text-[13px] leading-relaxed text-muted">
            AMC plan prices are in <Link href="/admin/amc" className="font-semibold text-deep underline">AMC plans</Link>, and filter and part prices in{" "}
            <Link href="/admin/parts" className="font-semibold text-deep underline">Parts & accessories</Link>.
          </p>
        </div>
      </Panel>

      <div>
        <Button type="submit" loading={pending}>
          Save prices
        </Button>
      </div>

      <ConfirmDialog
        open={confirmHide}
        onClose={() => setConfirmHide(false)}
        onConfirm={hideAll}
        pending={pending}
        confirmLabel="Hide every price"
        title="Hide every price?"
        description="The amounts are kept, hidden. Every button and card on the website goes back to “Get a quote”."
      />
    </form>
  );
}
