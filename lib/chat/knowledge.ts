import "server-only";
import { cache } from "react";
import { amcFaqs, annualFee, dailyCost, onCallNote, onCallSteps, recommendedPlan, visitChecks, type AmcSettings } from "@/content/amc";
import { sectors } from "@/content/clients";
import { aboutIntro } from "@/content/copy/about";
import { corporateCapabilities } from "@/content/copy/corporate";
import { hydrationModels } from "@/content/copy/hydration";
import { partCategories, type Part } from "@/content/parts";
import { noRentalPrices, provinces, type RentalPlan } from "@/content/pricing";
import { productTypeLabel, type Product } from "@/content/products";
import { rentalInclusions } from "@/content/services";
import { site, type SiteContact } from "@/content/site";
import {
  getAmc,
  getCopy,
  getFaqs,
  getFunctionalWaters,
  getParts,
  getPricing,
  getProducts,
  getRentalPlans,
  getServices,
  getShownPrices,
  getSiteSettings,
} from "@/lib/cms/content";
import { pricesFrom, type ShownPrices } from "@/lib/cms/map";
import { formatLKR, formatLKRCents } from "@/lib/format";
import type { PriceBook, QuoteCatalog } from "@/lib/chat/quote";
import { CMS_TAG } from "@/lib/supabase/public";
import { createServiceClient } from "@/lib/supabase/service";
import type { ChatPriceMode } from "@/lib/supabase/types";

/**
 * Everything the chat assistant knows about LUSAKO, built from what the admin publishes: products and their prices,
 * rental, AMC plans, parts, services, FAQs and contact details. It is read through the website's own loaders (cached
 * under the "cms" tag), so a change saved in the admin reaches the assistant straight away. Prices follow the
 * assistant's price setting: every amount in Prices & quotes, only the shown ones, or no purifier prices.
 */
export type ChatKnowledge = {
  /** The knowledge section of the system prompt. */
  text: string;
  prices: PriceBook;
  catalog: QuoteCatalog;
  contact: SiteContact;
};

/** Every amount in Prices & quotes, hidden ones included (only the server can read those), else the shown ones. */
async function allPrices(): Promise<ShownPrices> {
  const supabase = createServiceClient({ cacheTag: CMS_TAG });
  if (supabase) {
    const { data, error } = await supabase.from("cms_prices").select("product_id, item, amount, visible");
    if (!error && data) return pricesFrom(data.map((row) => ({ ...row, visible: true })));
    if (error) console.error("[chat] couldn't read the prices:", error.message);
  }
  return getShownPrices();
}

async function priceBook(mode: ChatPriceMode, products: Product[]): Promise<PriceBook> {
  if (mode === "none") {
    // Purifier prices stay on quote. The on-call fee is a service price: it may be shared when the website shows it.
    return { mode, products: {}, rental: noRentalPrices, onCallFee: (await getShownPrices()).onCallFee };
  }
  const grouped = mode === "all" ? await allPrices() : await getShownPrices();
  const bySlug: PriceBook["products"] = {};
  for (const product of products) {
    const entry = product.id ? grouped.products.get(product.id) : undefined;
    if (entry) bySlug[product.slug] = entry;
  }
  return { mode, products: bySlug, rental: grouped.rental, onCallFee: grouped.onCallFee };
}

const lkr = (amount: number | null | undefined) => (typeof amount === "number" ? `${formatLKR(amount)} + VAT` : "on quote");
/** Items joined into one line ("a; b; c"), without the full stop each one may end with. */
const list = (items: string[]) =>
  items
    .filter(Boolean)
    .map((item) => item.trim().replace(/\.$/, ""))
    .join("; ");

function productSection(product: Product, prices: PriceBook) {
  const entry = prices.products[product.slug];
  const options = product.variants.map((variant) => `${variant.label}${variant.code ? ` (model ${variant.code})` : ""}`);
  const priceLines = product.variants.flatMap((variant) => [
    `Buy ${variant.label}: ${lkr(entry?.buy[variant.filtration])}`,
    `Rent ${variant.label}: ${typeof entry?.rent[variant.filtration] === "number" ? `from ${lkr(entry?.rent[variant.filtration])} a month per unit` : "on quote"}`,
  ]);
  const lines = [
    `### ${product.name}: ${product.tagline}`,
    `- Page: /water-purifiers/${product.slug}`,
    `- Category: ${product.types.map(productTypeLabel).join(", ")}`,
    `- Purification options: ${options.join(" or ")}`,
    `- Water temperatures: ${product.temperatures.join(", ")}`,
    `- Installation: ${product.installation}. Warranty: ${product.warranty}.`,
    `- Summary: ${product.summary}`,
    product.highlights.length ? `- Highlights: ${product.highlights.join(", ")}` : "",
    product.features.length ? `- Features: ${list(product.features.map((feature) => `${feature.title}: ${feature.body}`))}` : "",
    product.whoFor.length ? `- Best for: ${list(product.whoFor.map((item) => `${item.title} (${item.body})`))}` : "",
    `- Which option: ${product.filtrationNote}`,
    product.specs?.length ? `- More specifications: ${list(product.specs.map((spec) => `${spec.label}: ${spec.value}`))}` : "",
    `- Prices: ${priceLines.join("; ")}`,
    ...(product.faqs ?? []).map((faq) => `- Q: ${faq.q} A: ${faq.a}`),
  ];
  return lines.filter(Boolean).join("\n");
}

function rentalSection(plans: RentalPlan[], prices: PriceBook) {
  const rental = prices.rental;
  const regionalOverrides = Object.entries(rental.regionalByProvince).map(
    ([id, amount]) => `${provinces.find((province) => province.id === id)?.label ?? id}: ${lkr(amount)} a month per unit`,
  );
  return [
    "## Renting (offices and companies)",
    "- Renting is one predictable monthly payment per unit. Included, according to the rental agreement:",
    ...rentalInclusions.map((item) => `  - ${item.title}: ${item.body}`),
    "- Rental plans:",
    ...plans.map(
      (plan) =>
        `  - ${plan.name} (${plan.stages}, ${plan.bestFor.toLowerCase()}): ${plan.description} Price: ${
          typeof rental.plans[plan.id] === "number" ? `from ${lkr(rental.plans[plan.id])} a month per unit` : "on quote"
        }.`,
    ),
    `- One-time initial payment per rented unit, paid once with the first month only: ${lkr(rental.initial)}.`,
    "- Western Province: the monthly rental only, no extra charge.",
    `- Outside the Western Province, the Regional Hydration Service (technical service, preventive maintenance and regional support) is added per unit per month, always as a separate line: ${lkr(rental.regional)}.`,
    ...(regionalOverrides.length ? [`- Regional Hydration Service in some provinces: ${regionalOverrides.join("; ")}.`] : []),
    "- Rentals start with a site assessment. LUSAKO maintains rented systems for the whole rental period, so they don't need an AMC.",
    "- Rental quote builder on the website: /rental (rental page). Rental requests: /contact?type=rental#quote",
  ].join("\n");
}

function amcSection(amc: AmcSettings, onCallFee: number | null) {
  return [
    "## AMC (Annual Maintenance Contracts, for purchased purifiers)",
    "- Page: /service-support/amc",
    ...amc.plans.map((plan) =>
      [
        `- ${plan.name}${plan.id === recommendedPlan ? " (recommended)" : ""}: ${formatLKR(annualFee(plan))} a year + VAT where applicable (${formatLKR(plan.monthly)} a month equivalent, about ${formatLKRCents(dailyCost(plan))} a day).`,
        `  ${plan.summary} Preventive maintenance visits: ${plan.visits} a year. Tank chlorination and sanitation: ${plan.sanitations} a year. Priority service: ${plan.priority ? "yes" : "no"}. Discount on eligible filters: ${plan.filterDiscount}%. Discount on eligible spare parts: ${plan.partsDiscount}%.${plan.labourNote ? ` ${plan.labourNote}` : ""}`,
      ].join("\n"),
    ),
    `- Bought separately: a preventive maintenance visit is ${formatLKR(amc.fees.visit)}, a tank chlorination and sanitation service ${formatLKR(amc.fees.sanitation)}.`,
    `- On-call service (no contract): ${onCallSteps.map((step) => `${step.title}: ${step.body}`).join(" ")} ${onCallNote} Inspection / call-out fee: ${
      onCallFee !== null ? `${formatLKR(onCallFee)} + VAT` : "confirmed when the visit is booked"
    }.`,
    `- Every scheduled visit checks: ${visitChecks.join("; ")}.`,
    "- To start an AMC: request a service at /contact?type=service#quote, or leave details here.",
  ].join("\n");
}

function partsSection(parts: Part[]) {
  return [
    "## Filters, spare parts and accessories",
    "- Page: /service-support/parts",
    ...partCategories.map((category) => {
      const items = parts.filter((part) => part.category === category.id);
      if (!items.length) return "";
      return `- ${category.title}: ${list(
        items.map(
          (part) =>
            `${part.name} (${part.description}${part.price !== null ? ` Standard price ${formatLKR(part.price)}, excluding applicable taxes.` : " Price on request."}${
              part.life ? ` Typical life about ${part.life} months, depending on water quality and usage.` : ""
            })`,
        ),
      )}`;
    }),
    "- Genuine LUSAKO parts, fitted by LUSAKO technicians. AMC plans give discounts on eligible replacements.",
  ]
    .filter(Boolean)
    .join("\n");
}

function contactSection(contact: SiteContact) {
  return [
    "## Contact LUSAKO",
    contact.phones.length ? `- Office phone: ${contact.phones.join(", ")}` : "",
    contact.hotline ? `- Emergency breakdown hotline (calls and WhatsApp): ${contact.hotline}` : "",
    contact.whatsappSales ? `- WhatsApp for sales: ${contact.whatsappSales}` : "",
    contact.salesEmail ? `- Email: ${contact.salesEmail}${contact.operationsEmail ? ` (operations: ${contact.operationsEmail})` : ""}` : "",
    contact.hours ? `- Opening hours: ${contact.hours}` : "",
    contact.address ? `- Address: ${contact.address.split("\n").join(", ")}` : "",
    "- Quote and service request forms: /contact",
  ]
    .filter(Boolean)
    .join("\n");
}

/** The knowledge, priced for one price setting. Memoised per request. */
export const getChatKnowledge = cache(async (mode: ChatPriceMode): Promise<ChatKnowledge> => {
  const [products, plans, amc, parts, faqs, services, waters, settings, pricing, about, models, corporate] = await Promise.all([
    getProducts(),
    getRentalPlans(),
    getAmc(),
    getParts(),
    getFaqs(),
    getServices(),
    getFunctionalWaters(),
    getSiteSettings(),
    getPricing(),
    getCopy(aboutIntro),
    getCopy(hydrationModels),
    getCopy(corporateCapabilities),
  ]);
  const prices = await priceBook(mode, products);

  const text = [
    "## About LUSAKO",
    `- ${site.legalName}, trading as ${site.name}: ${site.descriptor} in Sri Lanka. Tagline: "${site.tagline}" Website: ${site.url}`,
    `- ${about.statement.join(" ")} ${about.description}`,
    "- Ways to get LUSAKO:",
    ...models.cards.map((card) => `  - ${card.label} (${card.audience.toLowerCase()}): ${card.promise} Payment: ${card.pay}. Best for: ${card.bestFor}. Looking after it: ${card.care}.`),
    "- UF (ultrafiltration) suits treated city (mains) water and keeps minerals; RO (reverse osmosis) suits well water and water with higher dissolved solids (TDS). LUSAKO recommends the right one for the customer's water.",
    `- Sectors served: ${sectors.join(", ")}, as well as homes.`,
    pricing.koko ? "- Purchases can be paid in instalments with KOKO." : "",
    "",
    contactSection(settings.contact),
    "",
    "## Water purifiers",
    "- All purifiers: /water-purifiers. Find my solution (three quick questions): /find-my-solution",
    "- Every purifier is available to buy; for offices and companies they can also be rented. Prices exclude VAT.",
    "",
    products.map((product) => productSection(product, prices)).join("\n\n"),
    "",
    rentalSection(plans, prices),
    "",
    "## Corporate hydration (organisations, multiple units or sites)",
    "- Page: /hydration-solutions/corporate. Proposal request: /contact?type=corporate#quote",
    `- ${corporate.description} What LUSAKO manages: ${list(corporate.cards.map((card) => `${card.title}: ${card.body}`))}.`,
    "- Corporate customers get a custom quotation for multiple units, usually after a site assessment.",
    "",
    "## LUSAKO Care services",
    "- Page: /service-support",
    ...services.map((service) => `- ${service.title}: ${service.body}`),
    "",
    amcSection(amc, prices.onCallFee),
    "",
    partsSection(parts),
    "",
    "## Functional water",
    "- Page: /functional-water",
    ...waters.map((water) => `- ${water.name}: ${water.body} (${water.points.join("; ")})`),
    "",
    "## Frequently asked questions",
    ...[...faqs, ...amcFaqs(amc)].map((faq) => `- Q: ${faq.q}\n  A: ${faq.a}`),
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    text,
    prices,
    catalog: { products, rentalPlans: plans, amcPlans: amc.plans, parts, koko: pricing.koko },
    contact: settings.contact,
  };
});
