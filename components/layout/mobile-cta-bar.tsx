import Link from "next/link";
import { cn } from "@/lib/cn";

const actions = [
  { href: "/water-purifiers", label: "Buy", hint: "Own your system", tone: "bg-frost text-ink", hintTone: "text-muted" },
  { href: "/rental", label: "Rent", hint: "Monthly plan", tone: "bg-pastel text-ink", hintTone: "text-muted" },
  { href: "/contact", label: "Get a quote", hint: "Talk to us", tone: "bg-ink text-white", hintTone: "text-white/70" },
];

/** Persistent BUY / RENT / GET A QUOTE on mobile (brief: UX requirements §15). */
export function MobileCtaBar() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {actions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className={cn("flex h-14 flex-col items-center justify-center rounded-2xl leading-tight transition-transform active:scale-[0.98]", action.tone)}
            >
              <span className="text-[15px] font-semibold">{action.label}</span>
              <span className={cn("text-[11px]", action.hintTone)}>{action.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
