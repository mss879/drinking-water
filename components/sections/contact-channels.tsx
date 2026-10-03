import { ContactLink, contactRows, type ContactRow } from "@/components/layout/contact-list";
import { IconBadge } from "@/components/ui/icon-badge";
import type { SiteContact } from "@/content/site";

/**
 * LUSAKO's contact channels, in the order a page wants them (ids from contactRows: phone, hotline, whatsapp,
 * whatsapp-emergency, sales-email, operations-email, hours, address). Anything not listed follows in the usual order.
 */
export function contactChannels(contact: SiteContact, first: string[] = []): ContactRow[] {
  const rows = contactRows(contact);
  const rank = (id: string) => (first.includes(id) ? first.indexOf(id) : first.length + rows.findIndex((row) => row.id === id));
  return [...rows].sort((a, b) => rank(a.id) - rank(b.id));
}

export function ChannelRow({ channel }: { channel: ContactRow }) {
  const { icon: Icon, label, values } = channel;
  return (
    <div className="flex min-h-14 items-center gap-4 py-2">
      <IconBadge variant={channel.id === "hotline" ? "deep" : "tint"} size="sm" brand={false}>
        <Icon />
      </IconBadge>
      <span className="min-w-0">
        <span className="block text-xs text-muted">{label}</span>
        <span className="flex flex-wrap gap-x-3 text-[15px] font-medium text-ink">
          {values.map((value) => (
            <ContactLink
              key={value.text}
              value={value}
              className={value.href ? "min-w-0 transition-colors hover:text-deep hover:underline hover:decoration-brand hover:underline-offset-4" : "min-w-0"}
            />
          ))}
        </span>
      </span>
    </div>
  );
}
