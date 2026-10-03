import { Building2, Droplets, Waves, Wrench, type LucideIcon } from "lucide-react";

export const site = {
  name: "LUSAKO",
  legalName: "LUSAKO Holdings (Pvt) Ltd",
  tagline: "Better Water. Better Way.",
  descriptor: "Water Purification & Hydration Solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://drinkingwater.lk",
  description:
    "Bottleless water purification and hydration for homes, offices and businesses in Sri Lanka: buy a LUSAKO purifier, rent for your office, or let us manage it.",
  pillars: ["Buy", "Rent", "Hydrate", "Care"] as const,
};

/** How to reach LUSAKO. Numbers are kept as people write them; lib/contact.ts turns them into links. */
export type SiteContact = {
  /** The office lines, in order. */
  phones: string[];
  /** Emergency breakdown hotline (also on WhatsApp). */
  hotline: string;
  whatsappSales: string;
  whatsappEmergency: string;
  salesEmail: string;
  operationsEmail: string;
  hours: string;
  /** One line per row. */
  address: string;
};

export const socialNetworks = ["linkedin", "facebook", "instagram", "youtube", "tiktok"] as const;
export type SocialNetwork = (typeof socialNetworks)[number];
export type SocialLink = { network: SocialNetwork; url: string };

export const socialLabels: Record<SocialNetwork, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

export type SiteSettings = { contact: SiteContact; social: SocialLink[] };

/** The client's official details (LUSAKO website changes, October 2026). The admin can change them in Site settings. */
export const defaultSettings: SiteSettings = {
  contact: {
    phones: ["011 433 4885", "011 433 4886"],
    hotline: "075 910 1001",
    whatsappSales: "075 910 1276",
    whatsappEmergency: "075 910 1001",
    salesEmail: "admin@drinkingwater.lk",
    operationsEmail: "operations@drinkingwater.lk",
    hours: "Monday to Friday, 8.30 AM – 5.30 PM",
    address: "19A, 1st Lane, Gothami Road\nColombo 08\nSri Lanka",
  },
  // TODO(client): the LinkedIn, Facebook and other profile addresses. Each icon appears once its link is added.
  social: [],
};

export type NavLink = { label: string; href: string; description?: string };
/** `match` lists the path prefixes that mark the item as the current section. */
export type NavItem = NavLink & { icon: LucideIcon; match: string[]; children?: NavLink[]; chips?: NavLink[] };

/** The catalogue's categories, as quick links (the catalogue reads ?type= and filters to it). */
const categoryChips: NavLink[] = [
  { label: "Countertop", href: "/water-purifiers?type=countertop#catalogue" },
  { label: "Freestanding", href: "/water-purifiers?type=freestanding#catalogue" },
  { label: "Under-sink", href: "/water-purifiers?type=under-sink#catalogue" },
  { label: "Wall-mount", href: "/water-purifiers?type=wall-mount#catalogue" },
  { label: "Sparkling", href: "/water-purifiers?type=sparkling#catalogue" },
];

/**
 * Per the brief, Rental and Corporate are not separate products in the menu —
 * they sit under Hydration Solutions as BUY | RENT | CORPORATE.
 */
export const primaryNav: NavItem[] = [
  {
    label: "Water Purifiers",
    href: "/water-purifiers",
    icon: Droplets,
    match: ["/water-purifiers", "/functional-water"],
    chips: categoryChips,
    children: [
      { label: "All water purifiers", href: "/water-purifiers", description: "Countertop, freestanding, under-sink, wall-mount and sparkling." },
      { label: "Functional water", href: "/functional-water", description: "Sparkling, hydrogen and alkaline water on tap." },
      { label: "Find my solution", href: "/find-my-solution", description: "Three quick questions, the right system." },
    ],
  },
  {
    label: "Hydration Solutions",
    href: "/hydration-solutions",
    icon: Waves,
    match: ["/hydration-solutions", "/rental"],
    children: [
      { label: "Buy", href: "/water-purifiers", description: "Own your water purification system." },
      { label: "Rent", href: "/rental", description: "Complete hydration for one predictable monthly payment." },
      { label: "Corporate", href: "/hydration-solutions/corporate", description: "One partner for your workplace hydration." },
      { label: "All hydration solutions", href: "/hydration-solutions", description: "For homes, offices and companies." },
    ],
  },
  {
    label: "Service & Support",
    href: "/service-support",
    icon: Wrench,
    match: ["/service-support"],
    children: [
      { label: "LUSAKO Care", href: "/service-support", description: "Installation, maintenance and technical support." },
      { label: "AMC plans", href: "/service-support/amc", description: "Essential, Complete or Maximum annual care." },
      { label: "Filters, parts & accessories", href: "/service-support/parts", description: "Genuine cartridges, spare parts and accessories." },
      { label: "Request a service", href: "/contact?type=service#quote", description: "Book a visit from our service team." },
    ],
  },
  {
    label: "Company",
    href: "/why-lusako",
    icon: Building2,
    match: ["/why-lusako", "/clients", "/about", "/blog", "/faq"],
    children: [
      { label: "Why LUSAKO", href: "/why-lusako", description: "A hydration partner, not an appliance catalogue." },
      { label: "Our clients", href: "/clients", description: "Success stories from homes to organisations." },
      { label: "About LUSAKO", href: "/about", description: "Water purification & hydration solutions." },
      { label: "Blog", href: "/blog", description: "Guides and news on purified water." },
      { label: "FAQs", href: "/faq", description: "UF vs RO, rental terms, installation and more." },
    ],
  },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Hydration solutions",
    links: [
      { label: "Buy a water purifier", href: "/water-purifiers" },
      { label: "Rent for your office", href: "/rental" },
      { label: "Corporate hydration", href: "/hydration-solutions/corporate" },
      { label: "Functional water", href: "/functional-water" },
      { label: "Find my solution", href: "/find-my-solution" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why LUSAKO", href: "/why-lusako" },
      { label: "Our clients", href: "/clients" },
      { label: "About LUSAKO", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Service & support", href: "/service-support" },
      { label: "AMC plans", href: "/service-support/amc" },
      { label: "Filters, parts & accessories", href: "/service-support/parts" },
      { label: "Request a service", href: "/contact?type=service#quote" },
      { label: "Contact / Get a quote", href: "/contact" },
    ],
  },
];
