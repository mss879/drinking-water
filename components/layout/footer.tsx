import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { products } from "@/content/products";
import { footerNav, site, type NavLink } from "@/content/site";

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h2 className="text-xs font-medium tracking-[0.18em] text-white/55 uppercase">{title}</h2>
      <ul className="mt-5 grid gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-[15px] text-white/85 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const contact = [
    { icon: Phone, label: site.contact.phoneDisplay, href: site.contact.phoneHref },
    { icon: Mail, label: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Clock, label: site.contact.hours },
    { icon: MapPin, label: site.contact.address },
  ];

  return (
    <footer className="relative z-10 overflow-hidden rounded-t-[40px] bg-abyss text-white lg:rounded-t-[56px]">
      <Container className="pt-16 pb-36 lg:pt-20 lg:pb-12">
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
            <p className="mt-7 text-2xl leading-snug">Better water. Better way.</p>
            <p className="mt-3 max-w-sm text-white/65">
              Water purification and hydration solutions for homes, offices and organisations across Sri Lanka.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact" variant="white" arrow>
                Get a quote
              </ButtonLink>
              <a
                href={site.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-medium transition-colors hover:bg-white/10"
              >
                <MessageCircle aria-hidden className="size-4" /> WhatsApp
              </a>
            </div>
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

        <ul className="mt-14 grid gap-5 border-t border-white/10 pt-8 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-4">
          {contact.map(({ icon: Icon, label, href }) => (
            <li key={label} className="flex items-center gap-3">
              <Icon aria-hidden className="size-4 shrink-0 text-aqua" />
              {href ? (
                <a href={href} className="transition-colors hover:text-white">
                  {label}
                </a>
              ) : (
                label
              )}
            </li>
          ))}
        </ul>

        <div data-wordmark className="mx-auto mt-12 w-full max-w-[1100px] opacity-[0.06] select-none">
          <Logo inverted className="h-auto w-full" />
        </div>

        <div className="mt-8 flex flex-col gap-3 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LUSAKO. All rights reserved.</p>
          <p className="tracking-[0.22em]">BUY • RENT • HYDRATE • CARE</p>
        </div>
      </Container>
    </footer>
  );
}
