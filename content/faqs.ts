/**
 * The 15 essential FAQ topics from the brief (§17).
 * TODO(client): answers are drafted from the brief — have LUSAKO approve them before launch.
 */
export type FaqTopic = "purification" | "buying" | "rental" | "service";

export type Faq = { q: string; a: string; topic: FaqTopic };

export const faqTopics: { id: FaqTopic; label: string }[] = [
  { id: "purification", label: "Choosing UF or RO" },
  { id: "buying", label: "Buying a purifier" },
  { id: "rental", label: "Rental" },
  { id: "service", label: "Installation & service" },
];

export const faqs: Faq[] = [
  {
    topic: "purification",
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
    q: "Can I buy the machine instead of renting?",
    a: "Yes. Every LUSAKO water purifier is available to buy outright, and for homes buying is usually the best long-term value. You own the system, it is covered by warranty, and LUSAKO after-sales service and maintenance plans are available.",
  },
  {
    topic: "rental",
    q: "What is included in the monthly rental?",
    a: "Your rental covers the LUSAKO purification system, professional installation, scheduled preventive maintenance, filter replacement and technical support, according to your rental agreement. The exact inclusions are set out in your agreement before you sign.",
  },
  {
    topic: "rental",
    q: "What is the Rs. 6,000 initial payment?",
    a: "It is a one-time payment of Rs. 6,000 per rented unit, payable only in the first month. From the second month onwards, you pay only the monthly rental.",
  },
  {
    topic: "rental",
    q: "Why is there a refundable Rs. 25,000 domestic rental deposit?",
    a: "Home (domestic) rentals include a refundable security deposit of Rs. 25,000 because the equipment remains LUSAKO’s property while it is in your home. It is refunded according to your rental agreement.",
  },
  {
    topic: "rental",
    q: "Does the Regional Hydration Service apply in Western Province?",
    a: "No. Customers in the Western Province pay the monthly rental only. There is no Regional Hydration Service charge.",
  },
  {
    topic: "rental",
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
    a: "Raise a service request online, by phone or on WhatsApp. Rental systems are maintained by LUSAKO throughout the rental period. Purchased systems are supported by their warranty and by LUSAKO Care service plans, including AMC.",
  },
  {
    topic: "rental",
    q: "What happens after the rental contract ends?",
    a: "You can renew your rental, and upgrades are available at renewal, subject to your plan. Termination and relocation terms are set out in your rental agreement.",
  },
  {
    topic: "rental",
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

export const homeFaqs = [0, 4, 5, 7, 8, 12].map((i) => faqs[i]);
