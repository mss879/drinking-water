import { BookOpenText, CircleHelp, Contact, Droplets, Filter, Handshake, Images, Newspaper, ShieldCheck, Tag, Type, type LucideIcon } from "lucide-react";

export type WebsiteSection = { href: string; label: string; short: string; icon: LucideIcon; description: string };

/** The admin's Website group: everything the client can change on drinkingwater.lk without a developer. */
export const websiteSections: WebsiteSection[] = [
  {
    href: "/admin/products",
    label: "Products",
    short: "Products",
    icon: Droplets,
    description: "The water purifiers: photos, categories, UF and RO options, extra specifications and questions, search titles, and which products Find my solution recommends.",
  },
  {
    href: "/admin/pricing",
    label: "Prices & quotes",
    short: "Prices",
    icon: Tag,
    description: "Buy and rent-from prices for every purifier option, rental plan and charge prices, the on-call fee and the KOKO badge. Each price shows only when you switch it on.",
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
    href: "/admin/pages",
    label: "Page text",
    short: "Text",
    icon: Type,
    description: "The wording on every page: headings, paragraphs, lists, button labels, and the title and description Google shows.",
  },
  {
    href: "/admin/faqs",
    label: "FAQs",
    short: "FAQs",
    icon: CircleHelp,
    description: "Add, edit, reorder or hide the questions and answers, and choose which ones the home and corporate pages show.",
  },
  {
    href: "/admin/logos",
    label: "Client logos",
    short: "Logos",
    icon: Handshake,
    description: "Add, replace, reorder or remove the client logos on the Our clients page and the home page.",
  },
  {
    href: "/admin/stories",
    label: "Client stories",
    short: "Stories",
    icon: BookOpenText,
    description: "The success stories on Our clients: add, edit, reorder or hide them.",
  },
  {
    href: "/admin/photos",
    label: "Website images",
    short: "Images",
    icon: Images,
    description: "Replace the image at the top of each page and the lifestyle photos with LUSAKO’s own.",
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
