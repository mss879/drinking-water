import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Droplets, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import { FindMySolution } from "@/components/forms/find-my-solution";
import { PageHero } from "@/components/sections/page-hero";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { IconBadge } from "@/components/ui/icon-badge";
import { marked } from "@/components/ui/marked";
import {
  finderHero,
  finderQuestions,
  finderRecommendation,
  finderResult,
  finderSeo,
  finderTalk,
  finderWhy,
} from "@/content/copy/finder";
import { getCopy, getPhotos, getPicks, getProducts, getRentalPlans, getRentalPrices, getSiteSettings } from "@/lib/cms/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { finderPicks, finderPlans } from "@/lib/recommend";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(finderSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/find-my-solution" });
}

/** The "Why we ask" cards' icons, by position (their wording is the finder.why block). */
const reasonIcons = [MapPin, Droplets, Users];

export default async function FindMySolutionPage() {
  const [photos, { contact }, products, picks, plans, prices, hero, questions, recommendation, result, why, talk] = await Promise.all([
    getPhotos(),
    getSiteSettings(),
    getProducts(),
    getPicks(),
    getRentalPlans(),
    getRentalPrices(),
    getCopy(finderHero),
    getCopy(finderQuestions),
    getCopy(finderRecommendation),
    getCopy(finderResult),
    getCopy(finderWhy),
    getCopy(finderTalk),
  ]);
  const reasons = why.cards.map((card, i) => ({ ...card, icon: reasonIcons[i] }));
  return (
    <>
      <PageHero
        crumbs={[{ label: "Find my solution", href: "/find-my-solution" }]}
        eyebrow={hero.eyebrow}
        title={hero.title.map((line) => marked(line))}
        description={hero.description}
        image={{ src: photos.waterTest.src, position: "object-[50%_40%]" }}
      />

      <div className="pt-10 pb-16 md:pt-14 lg:pt-16 lg:pb-24">
        <Container>
          <FindMySolution
            products={products.map(({ slug, name, tagline, image }) => ({ slug, name, tagline, image }))}
            picks={finderPicks(picks.finder, products)}
            plans={finderPlans(plans, prices)}
            copy={{ questions, recommendation, result }}
          />
        </Container>
      </div>

      <section className="pb-16 lg:pb-24">
        <Container>
          <div data-no-reveal className="grid gap-10 border-t border-line pt-12 lg:grid-cols-12 lg:gap-12 lg:pt-16">
            <div data-reveal="up" className="lg:col-span-4">
              <span className="label">{why.eyebrow}</span>
              <h2 className="mt-5 max-w-sm font-display text-h3 font-bold text-ink">{why.title}</h2>
            </div>
            <ul data-stagger className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
              {reasons.map(({ icon: Icon, title, body }, i) => (
                <li key={i} className="card-line p-6">
                  <span className="grid size-14 place-items-center rounded-card-sm bg-tint">
                    <IconBadge size="sm">
                      <Icon />
                    </IconBadge>
                  </span>
                  <h3 className="mt-6 font-display text-lg font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
        <Container>
          <div data-expand className="relative isolate flex flex-col gap-8 overflow-hidden rounded-card-xl bg-deep p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <WaveLines lines={5} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-white/15" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-h3 font-bold">{talk.title}</h2>
              <p className="mt-3 text-white">
                {marked(talk.text, {
                  mark: (words) => (
                    <Link href="/contact" className="font-semibold text-white underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-mist">
                      {words}
                    </Link>
                  ),
                })}
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm text-white">
                <Clock aria-hidden className="size-4 shrink-0 text-mist" />
                {contact.hours}
              </p>
            </div>
            <div className="relative flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={telHref(contact.phones[0] ?? contact.hotline)} className={buttonClasses({ variant: "white", size: "lg" })}>
                <Phone aria-hidden className="size-4" />
                {contact.phones[0] ?? contact.hotline}
              </a>
              <a
                href={whatsappHref(contact.whatsappSales, contact.whatsappGreeting)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "glass", size: "lg" })}
              >
                <MessageCircle aria-hidden className="size-4" />
                {talk.whatsappButton}
                <span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
