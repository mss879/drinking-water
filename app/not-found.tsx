import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Droplets, House, MessageCircle, type LucideIcon } from "lucide-react";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { Container } from "@/components/ui/container";
import { PixelCluster } from "@/components/ui/decor";
import { Highlight } from "@/components/ui/highlight";
import { IconBadge } from "@/components/ui/icon-badge";
import { Pill } from "@/components/ui/pill";
import { photos } from "@/content/images";

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
    <section className="relative overflow-hidden pt-10 pb-14 lg:pt-14 lg:pb-20">
      <PixelCluster className="absolute top-24 left-[4%] hidden size-14 lg:block" />
      <PixelCluster variant="b" className="absolute top-60 right-[5%] hidden size-12 lg:block" />
      <Container className="relative flex flex-col items-center text-center">
        <div aria-hidden className="rise flex items-center justify-center gap-3 sm:gap-6">
          <span className="text-mega font-bold text-outline [--outline-w:2px]">4</span>
          <span className="relative shrink-0 rounded-full border border-line p-2 sm:p-3">
            <span className="relative block size-[clamp(5.5rem,17vw,10.5rem)] overflow-hidden rounded-full">
              <Image src={photos.waterRipple.src} alt="" fill sizes="(min-width: 1024px) 168px, 18vw" className="object-cover" />
            </span>
          </span>
          <span className="text-mega font-bold text-ink">4</span>
        </div>

        <Pill className="rise mt-10">Error 404</Pill>
        <h1 className="rise mt-6 max-w-[18ch] text-display font-medium text-ink">
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
                className="group/card flex h-full items-center gap-4 rounded-card bg-frost p-4 transition-colors duration-300 hover:bg-ice sm:p-5"
              >
                <IconBadge variant="white">
                  <Icon />
                </IconBadge>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{label}</span>
                  <span className="block text-sm text-muted">{hint}</span>
                </span>
                <ArrowCircle variant="pastel" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-muted">
          Not sure where to start?{" "}
          <Link
            href="/find-my-solution"
            className="font-medium text-ink underline decoration-sky underline-offset-4 transition-colors hover:decoration-brand"
          >
            Find my solution
          </Link>
        </p>
      </Container>
    </section>
  );
}
