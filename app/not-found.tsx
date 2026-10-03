import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Droplets, House, MessageCircle, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { TrackNotFound } from "@/components/analytics/track-not-found";
import { SiteChrome } from "@/components/layout/site-chrome";
import { PageTransition } from "@/components/motion/page-transition";
import { HeroCard } from "@/components/sections/hero-card";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";

// Next.js adds `noindex` to 404 responses automatically.
export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for could not be found. Explore LUSAKO water purifiers, rental or get a quote.",
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const links: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", hint: "Start from the beginning", icon: House },
  { href: "/water-purifiers", label: "Water purifiers", hint: "Own your system", icon: Droplets },
  { href: "/rental", label: "Rental", hint: "One monthly payment", icon: Building2 },
  { href: "/contact", label: "Contact us", hint: "Call or get a quote", icon: MessageCircle },
];

/**
 * The 404 page. It handles unknown URLs and every notFound() on the public site, and it sits outside the (site)
 * layout, so it brings the site chrome with it.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <PageTransition>
        <NotFoundContent />
      </PageTransition>
      <TrackNotFound />
    </SiteChrome>
  );
}

function NotFoundContent() {
  return (
    <>
      <HeroCard labelledBy="page-title">
        <WaveLines lines={4} className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full text-brand/25" />
        <div className="flex min-h-[26rem] flex-col items-center justify-center px-5 pt-[calc(var(--header-h)+2rem)] pb-12 text-center sm:px-8 lg:min-h-[min(36rem,64svh)] lg:pb-16">
          {/* 4 ◯ 4: the LUSAKO drop "o" stands in for the zero. */}
          <div
            aria-hidden
            className="rise flex items-center justify-center gap-[0.12em] font-display text-[length:clamp(4.5rem,18vw,8.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em]"
          >
            <span className="text-outline [--outline-c:var(--color-white)] [--outline-w:2px]">4</span>
            <span className="float relative block size-[0.95em] shrink-0">
              <Image src="/brand/lusako-mark.svg" alt="" fill sizes="(min-width: 640px) 128px, 18vw" className="object-contain" />
            </span>
            <span className="text-brand">4</span>
          </div>
          <div className="rise mt-8" style={delay(80)}>
            <Pill variant="glass">Error 404</Pill>
          </div>
          <h1
            id="page-title"
            className="hero-title mt-5 font-display text-[length:clamp(1.85rem,1.25rem+2.6vw,3rem)] leading-[1.08] font-bold tracking-[-0.03em]"
          >
            <span className="line-mask line-in">
              <span className="line" style={delay(160)}>
                We can’t find <Highlight>that page</Highlight>
              </span>
            </span>
          </h1>
          <p className="rise mt-5 max-w-xl text-lead text-white/80" style={delay(260)}>
            The link may be out of date, or the page may have moved. These will get you back on track.
          </p>
        </div>
      </HeroCard>

      <section className="py-12 md:py-16 lg:py-20">
        <Container className="flex flex-col items-center">
          <ul className="grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            {links.map(({ href, label, hint, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group/card card-line flex h-full items-center gap-4 p-4 transition-colors duration-300 hover:border-brand hover:bg-tint sm:p-5"
                >
                  <IconBadge>
                    <Icon />
                  </IconBadge>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-ink">{label}</span>
                    <span className="block text-sm text-muted">{hint}</span>
                  </span>
                  <ArrowCircle variant="deep" />
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-muted">
            Not sure where to start?{" "}
            <Link
              href="/find-my-solution"
              className="font-semibold text-deep underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:decoration-deep"
            >
              Find my solution
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
