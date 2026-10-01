"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { primaryNav, site, type NavItem } from "@/content/site";
import { cn } from "@/lib/cn";

type Tone = "dark" | "light";

/**
 * The navigation floats: one glass bar carrying the logo, a capsule of links and the quote button. It is smoked
 * glass with white type while it sits on the home hero film, and frosted white with ink type everywhere else.
 */
const bar: Record<Tone, string> = {
  dark: "border-white/15 bg-ink/55 text-white",
  light: "border-line bg-white/85 text-ink shadow-soft",
};
const capsule: Record<Tone, string> = { dark: "bg-white/10", light: "bg-tint" };
const navLink =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200";
const navIdle: Record<Tone, string> = {
  dark: "text-white/85 hover:bg-white/15 hover:text-white",
  light: "text-ink hover:bg-white hover:text-deep",
};
const navCurrent: Record<Tone, string> = { dark: "bg-white text-ink", light: "bg-white text-deep shadow-soft" };

function isActive(pathname: string, item: NavItem) {
  return item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function NavDropdown({ item, active, tone }: { item: NavItem; active: boolean; tone: Tone }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(navLink, active || open ? navCurrent[tone] : navIdle[tone])}
      >
        {item.label}
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div id={panelId} hidden={!open} className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-4">
        <ul className="card-line w-[360px] animate-fade-up p-2 shadow-float">
          {item.children?.map((child) => (
            <li key={child.label}>
              <Link
                href={child.href}
                onClick={() => setOpen(false)}
                className="group/item flex items-start justify-between gap-4 rounded-card-sm px-4 py-3 transition-colors hover:bg-tint"
              >
                <span>
                  <span className="block font-display text-[15px] font-semibold text-ink">{child.label}</span>
                  {child.description && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{child.description}</span>}
                </span>
                <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-deep transition-transform group-hover/item:rotate-45" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div id="mobile-menu" className="fixed inset-0 z-40 xl:hidden">
      <button type="button" aria-label="Close menu" tabIndex={-1} onClick={onNavigate} className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm" />
      <div
        data-lenis-prevent
        className="absolute inset-x-[5px] top-(--header-h) bottom-[5px] animate-fade-up overflow-y-auto rounded-2xl border border-line bg-canvas shadow-float"
      >
      <Container className="flex flex-col gap-8 pt-2 pb-36">
        <nav aria-label="Mobile">
          <ul>
            {primaryNav.map((item) => (
              <li key={item.label} className="border-b border-line py-5">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-4 font-display text-2xl font-semibold text-ink"
                >
                  {item.label}
                  <span className="grid size-10 place-items-center rounded-full bg-tint-2 text-deep">
                    <ArrowUpRight aria-hidden className="size-5" />
                  </span>
                </Link>
                {item.children && (
                  <ul className="mt-4 grid grid-cols-2 gap-2">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          className="block rounded-chip bg-tint px-3.5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-tint-2"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid gap-3">
          <ButtonLink href="/find-my-solution" onClick={onNavigate} variant="outline" size="lg" arrow>
            Find my solution
          </ButtonLink>
          <ButtonLink href="/contact" onClick={onNavigate} size="lg" arrow>
            Get a quote
          </ButtonLink>
        </div>
        <a href={site.contact.phoneHref} className="inline-flex items-center gap-2 font-medium text-deep">
          <Phone aria-hidden className="size-4" /> {site.contact.phoneDisplay}
        </a>
      </Container>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  // The menu is "open for" a path, so navigating anywhere closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mobileOpen = menuPath === pathname;
  // The same trick for "scrolled past the hero film": true only for the path it was measured on.
  const [pastHeroPath, setPastHeroPath] = useState<string | null>(null);
  const onFilm = pathname === "/" && pastHeroPath !== pathname && !mobileOpen;
  const tone: Tone = onFilm ? "dark" : "light";

  useEffect(() => {
    if (pathname !== "/") return;
    const measure = () => {
      const hero = document.querySelector<HTMLElement>("main [data-hero]");
      // Past the film once its lower edge has gone up under the pill.
      const past = hero ? hero.getBoundingClientRect().bottom < 56 : window.scrollY > window.innerHeight - 56;
      setPastHeroPath(past ? pathname : null);
    };
    const first = requestAnimationFrame(measure);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* The header keeps its place in the flow (so pages start below it) but only the pill takes clicks; the
          home hero slides up underneath it. */}
      <header className="pointer-events-none sticky top-0 z-50 h-(--header-h)">
        <div className="w-full px-3 pt-3 sm:px-5 lg:px-(--edge) lg:pt-3.5">
          <div
            className={cn(
              "nav-enter pointer-events-auto flex h-13 items-center justify-between gap-3 rounded-2xl border pr-1.5 pl-5 backdrop-blur-xl transition-[background-color,border-color,box-shadow,color] duration-500 lg:h-14.5 lg:pr-2 lg:pl-6",
              bar[tone],
            )}
          >
            <Link href="/" aria-label="LUSAKO home" className="-my-2 shrink-0 rounded-lg py-2">
              <Logo inverted={tone === "dark"} className="h-[26px] w-auto lg:h-[30px]" />
            </Link>

            <nav
              aria-label="Primary"
              className={cn("hidden items-center gap-0.5 rounded-xl p-1 transition-colors duration-500 xl:flex", capsule[tone])}
            >
              {primaryNav.map((item) => {
                const active = isActive(pathname, item);
                return item.children ? (
                  <NavDropdown key={item.label} item={item} active={active} tone={tone} />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(navLink, active ? navCurrent[tone] : navIdle[tone])}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <div className="hidden items-center gap-0.5 lg:flex">
                <Link href="/water-purifiers" className={cn(navLink, navIdle[tone])}>
                  Buy
                </Link>
                <Link href="/rental" className={cn(navLink, navIdle[tone])}>
                  Rent
                </Link>
                <ButtonLink href="/contact" size="sm" variant={tone === "dark" ? "white" : "primary"} arrow className="ml-1.5">
                  Get a quote
                </ButtonLink>
              </div>
              <button
                type="button"
                onClick={() => setMenuPath(mobileOpen ? null : pathname)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className={cn(
                  "grid size-10 cursor-pointer place-items-center rounded-xl border transition-colors duration-300 xl:hidden",
                  tone === "dark" ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : "border-line bg-white text-deep hover:border-deep",
                )}
              >
                {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {mobileOpen && <MobileMenu onNavigate={() => setMenuPath(null)} />}
    </>
  );
}
