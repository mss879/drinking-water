import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { splitWords } from "@/components/motion/split-words";
import { Container } from "@/components/ui/container";
import { PixelCluster } from "@/components/ui/decor";
import { Pill } from "@/components/ui/pill";
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
        <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-subtle">
          {trail.map((crumb, i) => (
            <li key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
              {i === trail.length - 1 ? (
                <span aria-current="page" className="text-ink">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="transition-colors hover:text-ink">
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

/** Inner-page hero in the reference style: pill eyebrow, big centred headline, pastel highlight. */
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
    <section className={cn("relative overflow-hidden pt-8 pb-14 lg:pt-12 lg:pb-20", className)}>
      <PixelCluster className="absolute top-32 left-[4%] hidden size-14 lg:block" />
      <PixelCluster variant="b" className="absolute top-48 right-[5%] hidden size-12 lg:block" />
      <Container className="relative flex flex-col items-center text-center">
        {crumbs && <Breadcrumbs items={crumbs} className="rise mb-8" />}
        {eyebrow && <Pill className="rise">{eyebrow}</Pill>}
        <h1
          className="split split-in mt-6 max-w-[18ch] text-display font-medium text-ink"
          style={{ "--split-delay": "80ms" } as CSSProperties}
        >
          {splitWords(title)}
        </h1>
        {description && (
          <p className="rise mt-6 max-w-2xl text-lead text-muted" style={delay(140)}>
            {description}
          </p>
        )}
        {actions && (
          <div className="rise mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row" style={delay(220)}>
            {actions}
          </div>
        )}
      </Container>
      {children}
    </section>
  );
}
