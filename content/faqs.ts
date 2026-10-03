import { formatLKR } from "@/lib/format";
import { rentalCharges } from "./pricing";

/**
 * The essential FAQ topics from the brief (§17). The AMC questions are worked out from the current plans in
 * content/amc.ts (`amcFaqs`), so their prices always match the AMC page.
 * TODO(client): answers are drafted from the brief — have LUSAKO approve them before launch.
 */
export type FaqTopic = "purification" | "buying" | "rental" | "service" | "amc";

/** `home` marks the questions the home page shows (no rental amounts there, at the client's request). */
export type Faq = { q: string; a: string; topic: FaqTopic; home?: boolean };

export const faqTopics: { id: FaqTopic; label: string }[] = [
  { id: "purification", label: "Choosing UF or RO" },
  { id: "buying", label: "Buying a purifier" },
  { id: "rental", label: "Rental" },
  { id: "service", label: "Installation & service" },
  { id: "amc", label: "AMC & service plans" },
];

const initial = formatLKR(rentalCharges.initialPaymentPerUnit);

export const faqs: Faq[] = [
  {
    topic: "purification",
    home: true,
    q: "What is the difference between UF and RO?",
    a: "UF (ultrafiltration) passes water through a fine membrane that removes particles, sediment and microorganisms while keeping naturally occurring minerals, which makes it ideal for treated city water. RO (reverse osmosis) uses a much finer membrane that also reduces dissolved salts and other dissolved solids (TDS), so it suits well water and water with higher TDS. You never have to work this out alone: we recommend the right one for your water.",
  },
  {
    topic: "purification",
    q: "Which purifier is suitable for city water?",
    a: "For treated city water, a UF system such as PureFlow UF is usually the right choice. If your supply has high dissolved solids we may recommend RO instead. Use Find My Solution or ask us to check your water.",
  },
  {
    topic: "purification",
    q: "Which purifier is suitable for well water?",
    a: "Well water often carries higher dissolved solids, so we generally recommend RO, such as PureFlow RO. The final recommendation depends on your water condition, which our team can assess.",
  },
  {
    topic: "buying",
    home: true,
    q: "Can I buy the machine instead of renting?",
    a: "Yes. Every LUSAKO water purifier is available to buy outright, and for homes buying is usually the best long-term value. You own the system, it is covered by warranty, and LUSAKO after-sales service and maintenance plans are available.",
  },
  {
    topic: "rental",
    home: true,
    q: "What is included in the monthly rental?",
    a: "Your rental covers the LUSAKO purification system, professional installation, scheduled preventive maintenance, filter replacement and technical support, according to your rental agreement. The exact inclusions are set out in your agreement before you sign.",
  },
  {
    topic: "rental",
    q: `What is the ${initial} initial payment?`,
    a: `It is a one-time payment of ${initial} per rented unit, payable only in the first month together with the first month’s rental. From the second month onwards, you pay only the monthly rental.`,
  },
  {
    topic: "rental",
    home: true,
    q: "Does the Regional Hydration Service apply in Western Province?",
    a: "No. Customers in the Western Province pay the monthly rental only. There is no Regional Hydration Service charge.",
  },
  {
    topic: "rental",
    home: true,
    q: "What is the Regional Hydration Service for Non-Western Province?",
    a: "Outside the Western Province, a Regional Hydration Service charge covers the additional technical service, preventive maintenance and regional support needed to look after your system. It is always shown as a separate line item, never hidden inside the rental.",
  },
  {
    topic: "service",
    q: "How does installation work?",
    a: "Once you have chosen your system, a trained LUSAKO technician connects it to your existing water supply and checks that everything works as it should. Rentals start with a site assessment so the right machine goes in the right place.",
  },
  {
    topic: "service",
    q: "What happens if the machine requires service?",
    a: "Raise a service request online, by phone or on WhatsApp, or call the emergency breakdown hotline. Rental systems are maintained by LUSAKO throughout the rental period. Purchased systems are supported by their warranty and by an Annual Maintenance Contract or on-call service.",
  },
  {
    topic: "rental",
    q: "What happens after the rental contract ends?",
    a: "You can renew your rental, and upgrades are available at renewal, subject to your plan. Termination and relocation terms are set out in your rental agreement.",
  },
  {
    topic: "rental",
    home: true,
    q: "Can companies rent multiple machines?",
    a: "Yes. Companies can rent as many units as they need. For multiple units or sites we prepare a Corporate Hydration proposal, so you don’t have to pick machines one by one.",
  },
  {
    topic: "service",
    q: "Can LUSAKO support multiple company locations?",
    a: "Yes. Corporate Hydration Solutions cover single offices and multi-location organisations, with installation and service planning, preventive maintenance and centralised account management.",
  },
  {
    topic: "buying",
    q: "What warranty is provided for purchased products?",
    a: "Every purchased LUSAKO system comes with a product warranty, shown on each product page, plus access to LUSAKO after-sales service and Annual Maintenance Contracts.",
  },
];

export const homeFaqs = faqs.filter((faq) => faq.home);
