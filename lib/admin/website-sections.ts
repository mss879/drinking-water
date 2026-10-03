import { Contact, Droplets, Filter, Handshake, Images, Newspaper, ShieldCheck, type LucideIcon } from "lucide-react";

export type WebsiteSection = { href: string; label: string; short: string; icon: LucideIcon; description: string };

/** The admin's Website group: everything the client can change on drinkingwater.lk without a developer. */
export const websiteSections: WebsiteSection[] = [
  {
    href: "/admin/products",
    label: "Products",
    short: "Products",
    icon: Droplets,
    description: "The water purifiers: photos, categories, UF and RO prices, rental-from prices and every product page’s text.",
  },
  {
    href: "/admin/parts",
    label: "Parts & accessories",
    short: "Parts",
    icon: Filter,
    description: "Filter cartridges, spare parts and accessories, with photos and prices.",
  },
  {
    href: "/admin/amc",
    label: "AMC plans",
    short: "AMC",
    icon: ShieldCheck,
    description: "Prices, visits and discounts for the three annual maintenance plans, and the standalone service prices.",
  },
  {
    href: "/admin/logos",
    label: "Client logos",
    short: "Logos",
    icon: Handshake,
    description: "Add, replace, reorder or remove the client logos on the Our clients page.",
  },
  {
    href: "/admin/photos",
    label: "Photos",
    short: "Photos",
    icon: Images,
    description: "Replace the website’s lifestyle photos with LUSAKO’s own.",
  },
  {
    href: "/admin/site",
    label: "Contact & social",
    short: "Contact",
    icon: Contact,
    description: "Phone numbers, the emergency hotline, WhatsApp, emails, opening hours, the address and social media links.",
  },
  {
    href: "/admin/blog",
    label: "Blog",
    short: "Blog",
    icon: Newspaper,
    description: "Write, schedule and publish articles.",
  },
];
