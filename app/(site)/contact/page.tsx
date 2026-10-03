import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, Siren, Wrench, type LucideIcon } from "lucide-react";
import { ContactTabs } from "@/components/forms/contact-tabs";
import { ContactLink, type ContactValue } from "@/components/layout/contact-list";
import { PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { SocialIcons } from "@/components/ui/social-icons";
import { isLeadFormType, leadForms, type LeadFormType } from "@/content/forms";
import { site } from "@/content/site";
import { getSiteSettings } from "@/lib/cms/content";
import { addressLines, telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";
import { SriLankaMap } from "./sri-lanka-map";
import { heroImages } from "@/content/images";

export const metadata: Metadata = pageMetadata({
  title: "Contact / Get a Quote",
  description:
    "Call, WhatsApp or email LUSAKO, reach the breakdown hotline, or get a quote to buy or rent a water purifier, plan corporate hydration or book a service.",
  path: "/contact",
});

type Card = { icon: LucideIcon; title: string; lines: { label?: string; value: ContactValue }[]; dark?: boolean };

const valueLink = "font-display font-bold transition-colors hover:underline hover:decoration-2 hover:underline-offset-4";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { contact, social } = await getSiteSettings();
  const params = await searchParams;
  const type: LeadFormType = isLeadFormType(params.type) ? params.type : "buy";

  // Only single string values for fields that exist on the chosen form are carried into it.
  const fields = new Set(leadForms[type].fields.map((field) => field.name));
  const prefill: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== "string" || !fields.has(key)) continue;
    const clean = value.trim().slice(0, 500);
    if (clean) prefill[key] = clean;
  }

  // The contact details come first (client: visitors shouldn't have to scroll to the bottom to find them).
  const cards: Card[] = [
    {
      icon: Phone,
      title: "Call us",
      lines: contact.phones.map((number) => ({ value: { text: number, href: telHref(number) } })),
    },
    {
      icon: Siren,
      title: "Emergency breakdown",
      dark: true,
      lines: [
        ...(contact.hotline ? [{ label: "Hotline", value: { text: contact.hotline, href: telHref(contact.hotline) } }] : []),
        ...(contact.whatsappEmergency
          ? [{ label: "WhatsApp", value: { text: contact.whatsappEmergency, href: whatsappHref(contact.whatsappEmergency), external: true } }]
          : []),
      ],
    },
    {
      icon: MessageCircle,
      title: "WhatsApp sales",
      lines: contact.whatsappSales ? [{ value: { text: contact.whatsappSales, href: whatsappHref(contact.whatsappSales), external: true } }] : [],
    },
    {
      icon: Mail,
      title: "Email",
      lines: [
        ...(contact.salesEmail ? [{ label: "Sales", value: { text: contact.salesEmail, href: `mailto:${contact.salesEmail}` } }] : []),
        ...(contact.operationsEmail
          ? [{ label: "Technical & operations", value: { text: contact.operationsEmail, href: `mailto:${contact.operationsEmail}` } }]
          : []),
      ],
    },
  ];
  const address = addressLines(contact.address);

  return (
    <>
      <PageHero
        crumbs={[{ label: "Contact", href: "/contact" }]}
        eyebrow="Contact / Get a quote"
        title={["Tell us what", <>you <Highlight>need</Highlight></>]}
        description="Call, message or email the LUSAKO team, or choose the enquiry that fits below. Your request goes straight to the right team: direct sales, rental, business or service."
        actions={[
          { label: "Get a quote", href: "#quote" },
          ...(contact.phones[0] ? [{ label: `Call ${contact.phones[0]}`, href: telHref(contact.phones[0]), icon: Phone }] : []),
        ]}
        image={{ src: heroImages.contact, position: "object-right" }}
      />

      <section aria-labelledby="contact-details-title" className="pt-10 md:pt-14 lg:pt-16">
        <Container>
          <h2 id="contact-details-title" className="sr-only">
            Contact details
          </h2>
          <ul data-stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {cards
              .filter((card) => card.lines.length > 0)
              .map(({ icon: Icon, title, lines, dark }) => (
                <li
                  key={title}
                  className={cn("relative flex flex-col overflow-hidden p-6 sm:p-7", dark ? "rounded-card bg-deep text-white" : "card-line")}
                >
                  {dark && <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />}
                  <div className="relative flex items-center gap-3">
                    <span aria-hidden className={cn("grid size-11 shrink-0 place-items-center rounded-full", dark ? "bg-white text-deep" : "bg-tint-2 text-deep")}>
                      <Icon className="size-5" strokeWidth={1.9} />
                    </span>
                    <h3 className={cn("font-display text-[15px] font-bold", dark ? "text-white" : "text-ink")}>{title}</h3>
                  </div>
                  <ul className="relative mt-5 grid gap-2.5">
                    {lines.map(({ label, value }) => (
                      <li key={value.text + (label ?? "")}>
                        {label && <span className={cn("block text-xs", dark ? "text-white/80" : "text-muted")}>{label}</span>}
                        <ContactLink
                          value={value}
                          className={cn(
                            valueLink,
                            value.text.includes("@") ? "text-base" : "text-lg",
                            dark ? "text-white hover:decoration-white" : "text-ink hover:text-deep hover:decoration-brand",
                          )}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </Container>
      </section>

      <section className="pt-4 pb-16 md:pb-20 lg:pt-5 lg:pb-28">
        <Container className="grid gap-4 lg:grid-cols-12 lg:gap-5" data-no-reveal>
          <div id="quote" data-reveal="up" className="card-line scroll-mt-28 rounded-card-xl p-5 sm:p-8 lg:col-span-8 lg:p-10">
            <ContactTabs key={`${type}?${new URLSearchParams(prefill).toString()}`} initialType={type} prefill={prefill} />
          </div>

          <aside aria-label="Visit LUSAKO" className="flex flex-col gap-4 lg:col-span-4" data-stagger>
            <div className="card-line overflow-hidden rounded-card-xl p-6 sm:p-7">
              <div className="-mx-6 -mt-6 flex justify-center bg-tint px-6 pt-6 pb-4 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7">
                <SriLankaMap className="h-64 w-auto" />
              </div>
              <h2 className="mt-6 font-display text-h3 font-bold text-ink">{site.legalName}</h2>
              <ul className="mt-4 grid gap-3 text-[15px] text-ink">
                {address.length > 0 && (
                  <li className="flex gap-3">
                    <IconBadge variant="tint" size="sm" brand={false}>
                      <MapPin />
                    </IconBadge>
                    <span className="pt-2">
                      {address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </li>
                )}
                {contact.hours && (
                  <li className="flex items-center gap-3">
                    <IconBadge variant="tint" size="sm" brand={false}>
                      <Clock />
                    </IconBadge>
                    {contact.hours}
                  </li>
                )}
              </ul>
              <SocialIcons links={social} className="mt-5" />
            </div>

            <Link
              href="/find-my-solution"
              className="group/card relative flex min-h-60 flex-col overflow-hidden rounded-card-xl bg-deep p-6 text-white transition-colors duration-300 hover:bg-deep-hover sm:p-7"
            >
              <WaveLines lines={4} className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/15" />
              <span className="relative text-sm text-white">Not sure what you need?</span>
              <span className="relative mt-1 font-display text-h3 font-bold">Find my solution</span>
              <span className="relative mt-2 max-w-64 text-sm leading-relaxed text-white">
                Three quick questions and we’ll recommend UF or RO and the right system.
              </span>
              <span className="relative mt-auto flex justify-end pt-6">
                <ArrowCircle />
              </span>
            </Link>

            <Link
              href="/contact?type=service#quote"
              className="group/card card-line flex items-center gap-4 rounded-card-xl p-5 transition-colors hover:border-brand hover:bg-tint sm:p-6"
            >
              <IconBadge>
                <Wrench />
              </IconBadge>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">Existing customer?</span>
                <span className="block font-display font-bold text-ink">Request a service</span>
              </span>
              <ArrowCircle variant="deep" />
            </Link>
          </aside>
        </Container>
      </section>
    </>
  );
}
