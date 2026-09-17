import { Building2, Droplets, Waves, Wrench, type LucideIcon } from "lucide-react";

export const site = {
  name: "LUSAKO",
  tagline: "Better Water. Better Way.",
  descriptor: "Water Purification & Hydration Solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://drinkingwater.lk",
  description:
    "Bottleless water purification and hydration solutions for homes, offices and businesses in Sri Lanka. Buy a LUSAKO purifier, rent for your office, or let LUSAKO manage your workplace hydration.",
  pillars: ["Buy", "Rent", "Hydrate", "Care"] as const,
  // TODO(client): replace every contact value with the official details before launch.
  contact: {
    phoneDisplay: "+94 11 000 0000",
    phoneHref: "tel:+94110000000",
    whatsappHref: "https://wa.me/94770000000",
    email: "hello@drinkingwater.lk",
    hours: "Monday to Saturday, 8.30am – 5.30pm",
    address: "Showroom & service centre, Colombo",
  },
};

export type NavLink = { label: string; href: string; description?: string };
/** `match` lists the path prefixes that mark the item as the current section. */
export type NavItem = NavLink & { icon: LucideIcon; match: string[]; children?: NavLink[] };

/**
 * Per the brief, Rental and Corporate are not separate products in the menu —
 * they sit under Hydration Solutions as BUY | RENT | CORPORATE.
 */
export const primaryNav: NavItem[] = [
  { label: "Water Purifiers", href: "/water-purifiers", icon: Droplets, match: ["/water-purifiers"] },
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
  { label: "Service & Support", href: "/service-support", icon: Wrench, match: ["/service-support"] },
  {
    label: "Company",
    href: "/why-lusako",
    icon: Building2,
    match: ["/why-lusako", "/clients", "/about", "/faq"],
    children: [
      { label: "Why LUSAKO", href: "/why-lusako", description: "A hydration partner, not an appliance catalogue." },
      { label: "Our clients", href: "/clients", description: "Success stories from homes to organisations." },
      { label: "About LUSAKO", href: "/about", description: "Water purification & hydration solutions." },
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
      { label: "Find my solution", href: "/find-my-solution" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why LUSAKO", href: "/why-lusako" },
      { label: "Our clients", href: "/clients" },
      { label: "About LUSAKO", href: "/about" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Service & support", href: "/service-support" },
      { label: "Request a service", href: "/contact?type=service" },
      { label: "Get a quote", href: "/contact" },
    ],
  },
];
