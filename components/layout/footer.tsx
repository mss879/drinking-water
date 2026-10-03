import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ContactLink, contactRows } from "@/components/layout/contact-list";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Logo } from "@/components/ui/logo";
import { SocialIcons } from "@/components/ui/social-icons";
import { footerNav, site, type NavLink } from "@/content/site";
import { getProducts, getSiteSettings } from "@/lib/cms/content";
import { whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/cn";

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h2 className="font-display text-xs font-bold tracking-[0.18em] text-mist uppercase">{title}</h2>
      {/* The rhythm comes from each link's own padding, so the whole row is a comfortable tap target. */}
      <ul className="mt-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="inline-block py-1.5 text-[15px] text-white transition-colors hover:text-brand">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const [{ contact, social }, products] = await Promise.all([getSiteSettings(), getProducts()]);
  const rows = contactRows(contact);

  return (
    <footer data-surface="dark" className="relative z-10 overflow-hidden bg-ink text-white">
      <WaveLines lines={3} className="absolute inset-x-0 -top-10 h-40 w-full text-brand/40" />
      <Container className="relative pt-20 pb-36 lg:pt-24 lg:pb-12">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Image
              src="/brand/lusako-logo-white.svg"
              alt="LUSAKO – Technology for better life"
              width={296}
              height={103}
              unoptimized
              className="h-auto w-[210px]"
            />
            <p className="mt-8 font-display text-2xl leading-snug font-semibold">Better water. Better way.</p>
            <p className="mt-3 max-w-sm text-mist">
              Water purification and hydration solutions for homes, offices and organisations across Sri Lanka.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact" variant="white" arrow>
                Contact / Get a quote
              </ButtonLink>
              {contact.whatsappSales && (
                <a
                  href={whatsappHref(contact.whatsappSales)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
                >
                  <MessageCircle aria-hidden className="size-4" /> WhatsApp
                </a>
              )}
            </div>
            <SocialIcons links={social} tone="dark" className="mt-6" />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            <FooterColumn
              title="Water purifiers"
              links={products.map((product) => ({ label: product.name, href: `/water-purifiers/${product.slug}` }))}
            />
            {footerNav.map((column) => (
              <FooterColumn key={column.title} {...column} />
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-muted pt-8">
          <h2 className="font-display text-xs font-bold tracking-[0.18em] text-mist uppercase">{site.legalName}</h2>
          <ul className="mt-5 grid gap-x-8 gap-y-5 text-sm text-white sm:grid-cols-2 lg:grid-cols-4">
            {rows.map(({ id, icon: Icon, label, values }) => (
              <li key={id} className="flex items-start gap-3">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", id === "hotline" ? "bg-brand" : "bg-deep")}>
                  <Icon aria-hidden className="size-4 text-white" />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-xs text-mist">{label}</span>
                  <span className="flex flex-wrap gap-x-3">
                    {values.map((value) => (
                      <ContactLink key={value.text} value={value} className={cn("min-w-0 py-1", value.href && "transition-colors hover:text-brand")} />
                    ))}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div data-wordmark className="mx-auto mt-14 w-full max-w-[1100px] opacity-20 select-none">
          <Logo className="h-auto w-full" />
        </div>

        <div className="mt-8 flex flex-col gap-3 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p className="tracking-[0.22em]">BUY • RENT • HYDRATE • CARE</p>
        </div>
      </Container>
    </footer>
  );
}
