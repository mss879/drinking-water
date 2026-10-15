import { annualFee, type AmcPlan } from "@/content/amc";
import type { Part } from "@/content/parts";
import { isWestern, planFor, provinces, regionalCharge, type Filtration, type ProvinceId, type RentalPlan, type RentalPrices } from "@/content/pricing";
import type { Product } from "@/content/products";
import { formatLKR } from "@/lib/format";
import type { ChatPriceMode } from "@/lib/supabase/types";

/**
 * The chat assistant's price calculator. The assistant never does arithmetic itself: it asks for a quote (the
 * get_quote tool) and repeats these numbers, which come straight from the admin's Prices & quotes, AMC plans and
 * Parts. Anything without an amount the assistant may quote is "on quote".
 */

/** The prices the assistant may quote, already filtered by the admin's price setting. */
export type PriceBook = {
  mode: ChatPriceMode;
  /** By product slug: buy and rent-from prices per purification option. */
  products: Record<string, { buy: Partial<Record<Filtration, number>>; rent: Partial<Record<Filtration, number>> }>;
  rental: RentalPrices;
  onCallFee: number | null;
};

/** What the quote can be made of. */
export type QuoteCatalog = {
  products: Product[];
  rentalPlans: RentalPlan[];
  amcPlans: AmcPlan[];
  parts: Part[];
  koko: boolean;
};

export type QuoteKind = "buy" | "rent" | "amc" | "part";

export type QuoteRequestItem = {
  kind: QuoteKind;
  product?: string;
  plan?: string;
  option?: Filtration;
  part?: string;
  quantity?: number;
};

export type QuoteBilling = "one-time" | "monthly" | "yearly";

export type QuoteLine = {
  label: string;
  detail: string;
  billing: QuoteBilling;
  quantity: number;
  unitPrice: number | null;
  amount: number | null;
  /** One of several options (UF or RO) the visitor hasn't chosen between yet: left out of the totals. */
  alternative?: boolean;
};

export type Quote = {
  lines: QuoteLine[];
  totals: Record<QuoteBilling, number | null>;
  notes: string[];
  /** What the visitor asked for that isn't in the catalogue. */
  unmatched: string[];
  province: ProvinceId | null;
  createdAt: string;
};

const billingWords: Record<QuoteBilling, string> = { "one-time": "one-time", monthly: "a month", yearly: "a year" };

export const provinceIds = provinces.map((province) => province.id) as [ProvinceId, ...ProvinceId[]];

const squash = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

/** The best catalogue match for what the visitor typed: exact name or slug first, then one containing the other. */
function findBy<T>(items: T[], query: string | undefined, names: (item: T) => string[]): T | undefined {
  const q = squash(query ?? "");
  if (!q) return undefined;
  const scored = items
    .map((item) => {
      const keys = names(item).map(squash).filter(Boolean);
      if (keys.some((key) => key === q)) return { item, score: 3 };
      // Partial matches only for words long enough to mean something ("RO" is inside "AquaPrime Pro").
      const long = (key: string) => key.length >= 4 && q.length >= 4;
      if (keys.some((key) => long(key) && (key.startsWith(q) || q.startsWith(key)))) return { item, score: 2 };
      if (keys.some((key) => long(key) && (key.includes(q) || q.includes(key)))) return { item, score: 1 };
      return { item, score: 0 };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.item;
}

export function findProduct(catalog: QuoteCatalog, query?: string) {
  return findBy(catalog.products, query, (product) => [product.name, product.slug, ...product.variants.map((variant) => variant.code ?? "")]);
}

function findRentalPlan(catalog: QuoteCatalog, query?: string) {
  return findBy(catalog.rentalPlans, query, (plan) => [plan.name, plan.id]);
}

function findAmcPlan(catalog: QuoteCatalog, query?: string) {
  return findBy(catalog.amcPlans, query, (plan) => [plan.name, plan.short, plan.id]);
}

function findPart(catalog: QuoteCatalog, query?: string) {
  return findBy(catalog.parts, query, (part) => [part.name, part.id]);
}

const times = (price: number | null, quantity: number) => (price === null ? null : price * quantity);

export function priceText(amount: number | null) {
  return amount === null ? "on quote" : formatLKR(amount);
}

/** Works out a quote for what the visitor asked for, with only the prices the assistant may quote. */
export function buildQuote(
  request: { items: QuoteRequestItem[]; province?: ProvinceId | null },
  catalog: QuoteCatalog,
  prices: PriceBook,
  now = new Date(),
): Quote {
  const lines: QuoteLine[] = [];
  const unmatched: string[] = [];
  const province = request.province ?? null;
  let renting = false;
  let buying = false;

  const rentalExtras = (quantity: number) => {
    renting = true;
    const units = `${quantity} ${quantity === 1 ? "unit" : "units"}`;
    lines.push({
      label: "One-time initial payment",
      detail: `Per unit, paid once with the first month · ${units}`,
      billing: "one-time",
      quantity,
      unitPrice: prices.rental.initial,
      amount: times(prices.rental.initial, quantity),
    });
    if (province && !isWestern(province)) {
      const charge = regionalCharge(prices.rental, province) ?? null;
      lines.push({
        label: "Regional Hydration Service",
        detail: `Outside the Western Province, per unit · ${units}`,
        billing: "monthly",
        quantity,
        unitPrice: charge,
        amount: times(charge, quantity),
      });
    }
  };

  for (const item of request.items.slice(0, 8)) {
    const quantity = Math.min(Math.max(Math.floor(item.quantity ?? 1) || 1, 1), 500);
    const units = `${quantity} ${quantity === 1 ? "unit" : "units"}`;

    if (item.kind === "buy" || (item.kind === "rent" && item.product)) {
      const product = findProduct(catalog, item.product);
      if (!product) {
        unmatched.push(item.product || (item.kind === "buy" ? "a purifier to buy" : "a purifier to rent"));
        continue;
      }
      const entry = prices.products[product.slug];
      const chosen = product.variants.filter((variant) => !item.option || variant.filtration === item.option);
      const variants = chosen.length ? chosen : product.variants;
      for (const variant of variants) {
        const unitPrice = (item.kind === "buy" ? entry?.buy[variant.filtration] : entry?.rent[variant.filtration]) ?? null;
        lines.push({
          label: `${product.name} · ${variant.label}`,
          detail: item.kind === "buy" ? `Purchase price per unit · ${units}` : `Monthly rental per unit · ${units}`,
          billing: item.kind === "buy" ? "one-time" : "monthly",
          quantity,
          unitPrice,
          amount: times(unitPrice, quantity),
          ...(variants.length > 1 && { alternative: true }),
        });
      }
      if (item.kind === "buy") buying = true;
      else rentalExtras(quantity);
      continue;
    }

    if (item.kind === "rent") {
      const plan = findRentalPlan(catalog, item.plan) ?? (item.option ? planFor(item.option) : undefined);
      if (!plan) {
        unmatched.push(item.plan || "a rental plan");
        continue;
      }
      const unitPrice = prices.rental.plans[plan.id] ?? null;
      lines.push({
        label: `${plan.name} rental`,
        detail: `${plan.stages}, monthly per unit · ${units}`,
        billing: "monthly",
        quantity,
        unitPrice,
        amount: times(unitPrice, quantity),
      });
      rentalExtras(quantity);
      continue;
    }

    if (item.kind === "amc") {
      const plan = findAmcPlan(catalog, item.plan);
      if (!plan) {
        unmatched.push(item.plan || "an AMC plan");
        continue;
      }
      const fee = annualFee(plan);
      const machines = `${quantity} ${quantity === 1 ? "purifier" : "purifiers"}`;
      lines.push({
        label: `${plan.name} AMC`,
        detail: `${formatLKR(plan.monthly)} a month per purifier, as a yearly fee · ${machines}`,
        billing: "yearly",
        quantity,
        unitPrice: fee,
        amount: fee * quantity,
      });
      continue;
    }

    const part = findPart(catalog, item.part);
    if (!part) {
      unmatched.push(item.part || "a part");
      continue;
    }
    lines.push({
      label: part.name,
      detail: `Standard price per item · ${quantity} ${quantity === 1 ? "item" : "items"}`,
      billing: "one-time",
      quantity,
      unitPrice: part.price,
      amount: times(part.price, quantity),
    });
  }

  const totals = { "one-time": null, monthly: null, yearly: null } as Record<QuoteBilling, number | null>;
  for (const billing of Object.keys(totals) as QuoteBilling[]) {
    const counted = lines.filter((line) => line.billing === billing && !line.alternative);
    if (counted.length && counted.every((line) => line.amount !== null)) {
      totals[billing] = counted.reduce((sum, line) => sum + (line.amount ?? 0), 0);
    }
  }

  const notes = ["Prices are in LKR and exclude VAT."];
  if (lines.some((line) => line.alternative)) notes.push("The UF and RO options are alternatives: choose one (UF for treated city water, RO for well water or high TDS).");
  if (renting) {
    notes.push("Rental includes installation, preventive maintenance, filter replacement and technical support, according to the rental agreement.");
    if (!province) {
      notes.push(
        prices.rental.regional !== null
          ? `Outside the Western Province, the Regional Hydration Service adds ${formatLKR(prices.rental.regional)} a month per unit.`
          : "Outside the Western Province, a Regional Hydration Service charge is added per unit, as a separate line.",
      );
    } else if (isWestern(province)) {
      notes.push("There is no Regional Hydration Service charge in the Western Province.");
    }
  }
  if (buying && catalog.koko) notes.push("Purchases can be paid in instalments with KOKO.");
  if (lines.some((line) => line.amount === null)) notes.push("Amounts marked “on quote” are confirmed in LUSAKO’s formal quote.");
  notes.push("LUSAKO confirms the final price in a formal quote; rentals start with a site assessment.");

  return { lines, totals, notes, unmatched, province, createdAt: now.toISOString() };
}

/** The quote as short lines of text (the tool result, emails and the admin). */
export function quoteLines(quote: Quote) {
  return quote.lines.map((line) => {
    const each = line.quantity > 1 && line.unitPrice !== null ? ` (${formatLKR(line.unitPrice)} each)` : "";
    const per = line.billing === "one-time" ? "" : ` ${billingWords[line.billing]}`;
    return `${line.alternative ? "Option: " : ""}${line.label}: ${priceText(line.amount)}${line.amount !== null ? per : ""}${each}`;
  });
}

/**
 * The quote as the chat shows it (markdown): one line per item, then the totals when there's more than one item. The
 * assistant pastes it as it is, so labels and amounts can't be mixed up.
 */
export function quoteMarkdown(quote: Quote) {
  const lines = quote.lines.map((line) => {
    const per = line.amount !== null && line.billing !== "one-time" ? ` ${billingWords[line.billing]}` : "";
    const each = line.quantity > 1 && line.unitPrice !== null ? ` (${formatLKR(line.unitPrice)} each)` : "";
    return `- ${line.alternative ? "Option: " : ""}**${line.label}**: ${priceText(line.amount)}${per}${each}`;
  });
  const counted = quote.lines.filter((line) => !line.alternative).length;
  const totals = quoteTotals(quote);
  const total = counted > 1 && totals.length ? [`\n**Total: ${totals.join(" + ")}** (excluding VAT)`] : [];
  const vat = counted > 1 && totals.length ? [] : ["\nPrices exclude VAT."];
  return [...lines, ...total, ...vat].join("\n");
}

export function quoteTotals(quote: Quote) {
  const parts: string[] = [];
  if (quote.totals["one-time"] !== null) parts.push(`${formatLKR(quote.totals["one-time"])} one-time`);
  if (quote.totals.monthly !== null) parts.push(`${formatLKR(quote.totals.monthly)} a month`);
  if (quote.totals.yearly !== null) parts.push(`${formatLKR(quote.totals.yearly)} a year`);
  return parts;
}

/** A rough deal value for the CRM: one-time amounts plus a year of monthly and yearly charges. */
export function quoteValue(quote: Quote | null | undefined) {
  if (!quote) return null;
  const value = (quote.totals["one-time"] ?? 0) + (quote.totals.monthly ?? 0) * 12 + (quote.totals.yearly ?? 0);
  return value > 0 ? value : null;
}

/** Reads a quote saved on a chat (profile.quote) defensively. */
export function quoteFrom(value: unknown): Quote | null {
  if (!value || typeof value !== "object") return null;
  const quote = value as Partial<Quote>;
  if (!Array.isArray(quote.lines) || !quote.totals || typeof quote.totals !== "object") return null;
  return {
    lines: quote.lines.filter((line) => line && typeof line.label === "string").slice(0, 30),
    totals: { "one-time": quote.totals["one-time"] ?? null, monthly: quote.totals.monthly ?? null, yearly: quote.totals.yearly ?? null },
    notes: Array.isArray(quote.notes) ? quote.notes.filter((note) => typeof note === "string").slice(0, 10) : [],
    unmatched: Array.isArray(quote.unmatched) ? quote.unmatched.filter((item) => typeof item === "string").slice(0, 10) : [],
    province: typeof quote.province === "string" ? (quote.province as ProvinceId) : null,
    createdAt: typeof quote.createdAt === "string" ? quote.createdAt : new Date(0).toISOString(),
  };
}

