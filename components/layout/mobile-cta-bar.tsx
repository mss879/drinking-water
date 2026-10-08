import Link from "next/link";
import type { ContactLabels } from "@/components/layout/contact-list";
import { ContactSheet } from "@/components/layout/contact-sheet";
import type { chromeActionBar } from "@/content/copy/chrome";
import type { SiteContact, SocialLink } from "@/content/site";
import { cn } from "@/lib/cn";

/** Buy and Rent, in the order of the action bar block's first two buttons; their labels and hints come from it. */
const actions = [
  { href: "/water-purifiers", tone: "bg-tint text-ink", hintTone: "text-muted" },
  { href: "/rental", tone: "bg-tint-2 text-deep", hintTone: "text-deep" },
];

/**
 * Persistent BUY / RENT / CONTACT on mobile (brief: UX requirements §15); Contact opens the contact sheet. The
 * wording is the action bar block (content/copy/chrome.ts), read by SiteChrome.
 */
export function MobileCtaBar({
  contact,
  social,
  copy,
  labels,
}: {
  contact: SiteContact;
  social: SocialLink[];
  copy: typeof chromeActionBar.defaults;
  labels?: ContactLabels;
}) {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {actions.map((action, i) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center rounded-card-sm leading-tight transition-transform active:scale-[0.98]",
                action.tone,
              )}
            >
              <span className="text-[15px] font-semibold">{copy.actions[i].label}</span>
              <span className={cn("text-xs", action.hintTone)}>{copy.actions[i].hint}</span>
            </Link>
          </li>
        ))}
        <li>
          <ContactSheet contact={contact} social={social} copy={copy} labels={labels} />
        </li>
      </ul>
    </nav>
  );
}
