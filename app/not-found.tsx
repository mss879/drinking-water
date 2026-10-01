import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Droplets, House, MessageCircle, type LucideIcon } from "lucide-react";
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

const links: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", hint: "Start from the beginning", icon: House },
  { href: "/water-purifiers", label: "Water purifiers", hint: "Own your system", icon: Droplets },
  { href: "/rental", label: "Rental", hint: "One monthly payment", icon: Building2 },
  { href: "/contact", label: "Get a quote", hint: "Talk to our team", icon: MessageCircle },
];

export default function NotFound() {
  return (
    <section className="relative isolate overflow-x-clip pt-10 pb-16 md:pb-20 lg:pt-14 lg:pb-28">
      <WaveLines lines={3} className="pointer-events-none absolute inset-x-0 top-16 -z-10 h-64 w-full text-brand/15" />
      <Container className="relative flex flex-col items-center text-center">
        {/* 4 ◯ 4: the LUSAKO drop "o" stands in for the zero. */}
        <div
          aria-hidden
          className="rise flex items-center justify-center gap-[0.12em] font-display text-mega font-extrabold"
        >
          <span className="text-outline [--outline-w:2px]">4</span>
          <span className="float relative block size-[0.95em] shrink-0">
            <Image src="/brand/lusako-mark.svg" alt="" fill sizes="(min-width: 728px) 152px, 21vw" className="object-contain drop-shadow-icon" />
          </span>
          <span className="text-brand">4</span>
        </div>

        <Pill variant="tint" className="rise mt-10">
          Error 404
        </Pill>
        <h1 className="rise mt-6 max-w-[18ch] text-display font-bold text-ink">
          We can’t find <Highlight>that page</Highlight>
        </h1>
        <p className="rise mt-6 max-w-xl text-lead text-muted">
          The link may be out of date, or the page may have moved. These will get you back on track.
        </p>

        <ul className="rise mt-12 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-2">
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
  );
}
