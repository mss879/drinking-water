import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { site } from "@/content/site";

export type Channel = { icon: LucideIcon; label: string; value: string; href?: string; external?: boolean };

/** LUSAKO's contact channels from content/site.ts; the WhatsApp and address labels can be tuned per page. */
export function contactChannels({
  whatsapp = "Chat with our team",
  address = "Visit",
}: { whatsapp?: string; address?: string } = {}): Channel[] {
  return [
    { icon: Phone, label: "Call us", value: site.contact.phoneDisplay, href: site.contact.phoneHref },
    { icon: MessageCircle, label: "WhatsApp", value: whatsapp, href: site.contact.whatsappHref, external: true },
    { icon: Mail, label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Clock, label: "Hours", value: site.contact.hours },
    { icon: MapPin, label: address, value: site.contact.address },
  ];
}

export function ChannelRow({ channel }: { channel: Channel }) {
  const { icon: Icon, label, value, href, external } = channel;
  const content = (
    <>
      <IconBadge variant="pastel" size="sm" brand={false}>
        <Icon />
      </IconBadge>
      <span className="min-w-0">
        <span className="block text-xs text-subtle">{label}</span>
        <span className="block text-[15px] font-medium break-words text-ink">{value}</span>
      </span>
    </>
  );
  if (!href) return <div className="flex min-h-14 items-center gap-4 py-2">{content}</div>;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="-mx-3 flex min-h-14 items-center gap-4 rounded-card-sm px-3 py-2 transition-colors hover:bg-frost"
    >
      {content}
    </a>
  );
}
