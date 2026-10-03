"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChartLine, ExternalLink, Globe, Inbox, LayoutDashboard, SquareKanban, type LucideIcon } from "lucide-react";
import { AccountMenu } from "@/components/admin/shell/account-menu";
import { LiveInquiries } from "@/components/admin/shell/live-inquiries";
import { Logo } from "@/components/ui/logo";
import { websiteSections } from "@/lib/admin/website-sections";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; short: string; icon: LucideIcon; exact?: boolean; also?: string[] };

/** Sales and reporting first, in the order the client asked for; then everything that changes the website. */
const salesNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", short: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/inquiries", label: "Inquiries", short: "Inquiries", icon: Inbox },
  { href: "/admin/crm", label: "CRM pipeline", short: "CRM", icon: SquareKanban },
  { href: "/admin/analytics", label: "Web analytics", short: "Analytics", icon: ChartLine },
];

const websiteNav: NavItem[] = websiteSections;

/** Phones and tablets: the four sales sections, then one "Website" tab for everything in the Website group. */
const tabs: NavItem[] = [
  ...salesNav,
  { href: "/admin/website", label: "Website", short: "Website", icon: Globe, also: websiteNav.map((item) => item.href) },
];

function isActive(pathname: string, item: NavItem) {
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return item.exact ? pathname === item.href : matches(item.href) || Boolean(item.also?.some(matches));
}

function SidebarLink({ item, pathname, unread }: { item: NavItem; pathname: string; unread: number }) {
  const active = isActive(pathname, item);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition-colors duration-200",
        active ? "bg-white text-ink" : "text-white/80 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon aria-hidden className={cn("size-[18px] shrink-0", active ? "text-deep" : "text-mist")} />
      {item.label}
      {item.href === "/admin/inquiries" && <UnreadBadge count={unread} active={active} />}
    </Link>
  );
}

function UnreadBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] leading-none font-bold tabular-nums",
        active ? "bg-deep text-white" : "bg-white text-ink",
      )}
    >
      {count > 99 ? "99+" : count}
      <span className="sr-only"> unread</span>
    </span>
  );
}

/**
 * The admin frame. Large screens: an ink sidebar (the footer and hero-card language) with the white logo, the sales
 * sections, the Website group and the account menu. Phones and tablets: a frosted top bar and a tab bar along the bottom, styled like
 * the website's mobile action bar.
 */
export function AdminShell({ email, unread, children }: { email: string; unread: number; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-canvas">
      <LiveInquiries />

      {/* Sidebar */}
      <aside
        data-surface="dark"
        className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink px-4 pt-6 pb-5 text-white lg:flex"
      >
        <Link href="/admin" aria-label="LUSAKO admin home" className="mx-2 flex items-center gap-3 rounded-lg py-1">
          <Logo inverted className="h-7 w-auto" />
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">
            Admin
          </span>
        </Link>

        <nav aria-label="Admin" className="mt-10 min-h-0 overflow-y-auto">
          <ul className="grid gap-1">
            {salesNav.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} pathname={pathname} unread={unread} />
              </li>
            ))}
          </ul>
          <p className="mt-7 mb-2 px-3.5 text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">Website</p>
          <ul className="grid gap-1">
            {websiteNav.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} pathname={pathname} unread={unread} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto grid gap-3 border-t border-white/10 pt-5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-3 rounded-xl px-3.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink aria-hidden className="size-4 text-mist" />
            View website
          </a>
          <AccountMenu email={email} tone="dark" />
        </div>
      </aside>

      {/* Phone / tablet top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
        <Link href="/admin" aria-label="LUSAKO admin home" className="flex items-center gap-2.5 py-1">
          <Logo className="h-6 w-auto" />
          <span className="rounded-full bg-tint-2 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-deep uppercase">Admin</span>
        </Link>
        <AccountMenu email={email} tone="light" />
      </header>

      <main id="main" className="lg:pl-64">
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
          {children}
        </div>
      </main>

      {/* Phone / tablet tab bar */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5 px-1">
          {tabs.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                    active ? "text-deep" : "text-muted hover:text-ink",
                  )}
                >
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-tint-2")}>
                    <Icon aria-hidden className="size-[18px]" />
                  </span>
                  {item.short}
                  {item.href === "/admin/inquiries" && unread > 0 && (
                    <span className="absolute top-2 left-[calc(50%+0.5rem)] grid h-4 min-w-4 place-items-center rounded-full bg-deep px-1 text-[10px] leading-none text-white tabular-nums">
                      {unread > 99 ? "99+" : unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
