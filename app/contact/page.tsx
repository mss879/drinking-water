import type { Metadata } from "next";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { ContactTabs } from "@/components/forms/contact-tabs";
import { ChannelRow, contactChannels } from "@/components/sections/contact-channels";
import { PageHero } from "@/components/sections/page-hero";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { Container } from "@/components/ui/container";
import { Rings } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { isLeadFormType, leadForms, type LeadFormType } from "@/content/forms";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Get a Quote",
  description:
    "Get a quote from LUSAKO: buy a water purifier, rent for your office, request a corporate hydration proposal or book a service visit. Each request goes straight to the right team.",
  path: "/contact",
});

const channels = contactChannels();

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  return (
    <>
      <PageHero
        crumbs={[{ label: "Get a quote", href: "/contact" }]}
        eyebrow="Get a quote"
        title={
          <>
            Tell us what you <Highlight>need</Highlight>
          </>
        }
        description="Choose the enquiry that fits and share a few details. Your request goes straight to the right LUSAKO team: direct sales, rental, business or service."
      />

      <section className="pb-14 lg:pb-20">
        <Container className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div id="quote" className="rounded-card-xl bg-frost p-5 sm:p-8 lg:col-span-8 lg:p-10">
            <ContactTabs key={`${type}?${new URLSearchParams(prefill).toString()}`} initialType={type} prefill={prefill} />
          </div>

          <aside aria-label="Other ways to reach LUSAKO" className="flex flex-col gap-4 lg:col-span-4">
            <div className="rounded-card-xl border border-line p-6 sm:p-7">
              <h2 className="text-h3 font-medium text-ink">Talk to our team</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">Prefer to speak to someone? Call, message or visit us.</p>
              <ul className="mt-5 grid gap-1">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <ChannelRow channel={channel} />
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/find-my-solution"
              className="group/card relative flex min-h-60 flex-col overflow-hidden rounded-card-xl bg-pastel p-6 sm:p-7"
            >
              <Rings className="absolute -right-16 -bottom-20 size-72 text-white" />
              <span className="relative text-sm text-muted">Not sure what you need?</span>
              <span className="relative mt-1 text-h3 font-medium text-ink">Find my solution</span>
              <span className="relative mt-2 max-w-64 text-sm leading-relaxed text-muted">
                Three quick questions and we’ll recommend UF or RO and the right system.
              </span>
              <span className="relative mt-auto flex justify-end pt-6">
                <ArrowCircle />
              </span>
            </Link>

            <Link
              href="/contact?type=service#quote"
              className="group/card flex items-center gap-4 rounded-card-xl border border-line p-5 transition-colors hover:border-ink/25 sm:p-6"
            >
              <IconBadge variant="pastel">
                <Wrench />
              </IconBadge>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">Existing customer?</span>
                <span className="block font-medium text-ink">Request a service</span>
              </span>
              <ArrowCircle variant="outline" />
            </Link>
          </aside>
        </Container>
      </section>
    </>
  );
}
