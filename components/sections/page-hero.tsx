import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { splitWords } from "@/components/motion/split-words";
import { Container } from "@/components/ui/container";
import { WaveLines } from "@/components/ui/decor";
import { Tag } from "@/components/ui/pill";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/lib/jsonld";

export type Crumb = { label: string; href: string };

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Visible breadcrumb trail plus BreadcrumbList structured data. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const trail = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {trail.map((crumb, i) => (
            <li key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden className="size-3.5 text-brand" />}
              {i === trail.length - 1 ? (
                <span aria-current="page" className="font-medium text-deep">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="-my-2.5 inline-block py-2.5 transition-colors hover:text-deep">
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: crumb.label,
            item: new URL(crumb.href, site.url).toString(),
          })),
        }}
      />
    </>
  );
}

/**
 * Inner-page hero, after the GrowSphere split hero: breadcrumbs, then the headline on the left and the tag,
 * intro and actions on the right. `children` (usually a HeroMedia) follow underneath.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  crumbs,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-x-clip pt-8 pb-16 lg:pt-12 lg:pb-24", className)}>
      <WaveLines lines={3} className="pointer-events-none absolute inset-x-0 top-24 -z-10 h-56 w-full text-brand/15" />
      <Container>
        {crumbs && <Breadcrumbs items={crumbs} className="rise mb-8 lg:mb-12" />}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1
            className="split split-in text-display font-bold text-ink lg:col-span-7"
            style={{ "--split-delay": "80ms" } as CSSProperties}
          >
            {splitWords(title)}
          </h1>
          {(eyebrow || description || actions) && (
            <div className="lg:col-span-5 lg:pb-2">
              {eyebrow && (
                <div className="rise" style={delay(120)}>
                  <Tag badge={site.name}>{eyebrow}</Tag>
                </div>
              )}
              {description && (
                <p className="rise mt-5 text-lead text-muted" style={delay(180)}>
                  {description}
                </p>
              )}
              {actions && (
                <div className="rise mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={delay(240)}>
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
      {children}
    </section>
  );
}

/**
 * The wide photo under an inner-page hero (StomDent's wide hero image): rounded, black & white, opening out as it
 * scrolls. `children` overlay the photo (pills, captions); keep them at the corners.
 */
export function HeroMedia({
  image,
  priority = false,
  aspect = "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]",
  position = "object-center",
  children,
  className,
}: {
  image: { src: StaticImageData; alt: string };
  priority?: boolean;
  aspect?: string;
  position?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Container className={cn("mt-12 lg:mt-16", className)}>
      <div data-expand className={cn("relative overflow-hidden rounded-card-xl bg-tint-2", aspect)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1320px) 1224px, 100vw"
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? "eager" : undefined}
          className={cn("object-cover", position)}
        />
        {children}
      </div>
    </Container>
  );
}
