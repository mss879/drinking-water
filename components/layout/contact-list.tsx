import { Clock, Mail, MapPin, MessageCircle, Phone, Siren, Wrench, type LucideIcon } from "lucide-react";
import { chromeContactLabels } from "@/content/copy/chrome-labels";
import type { SiteContact } from "@/content/site";
import { addressLines, telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/cn";

export type ContactValue = { text: string; href?: string; external?: boolean };
export type ContactRow = { id: string; icon: LucideIcon; label: string; values: ContactValue[] };

/** The names over the contact details, in contactRows' order (Page text › Contact details: names). */
export type ContactLabels = readonly string[];

/**
 * Every way to reach LUSAKO, in the order people look for them, each under its name from `labels`. Empty details are
 * left out. The sales WhatsApp opens with the admin's greeting, when there is one; the emergency line opens blank.
 */
export function contactRows(contact: SiteContact, labels: ContactLabels = chromeContactLabels.defaults.labels): ContactRow[] {
  const [call, hotline, whatsapp, whatsappEmergency, sales, operations, hours, visit] = labels;
  const rows: ContactRow[] = [
    { id: "phone", icon: Phone, label: call, values: contact.phones.map((number) => ({ text: number, href: telHref(number) })) },
    {
      id: "hotline",
      icon: Siren,
      label: hotline,
      values: contact.hotline ? [{ text: contact.hotline, href: telHref(contact.hotline) }] : [],
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: whatsapp,
      values: contact.whatsappSales
        ? [{ text: contact.whatsappSales, href: whatsappHref(contact.whatsappSales, contact.whatsappGreeting), external: true }]
        : [],
    },
    {
      id: "whatsapp-emergency",
      icon: MessageCircle,
      label: whatsappEmergency,
      values: contact.whatsappEmergency
        ? [{ text: contact.whatsappEmergency, href: whatsappHref(contact.whatsappEmergency), external: true }]
        : [],
    },
    { id: "sales-email", icon: Mail, label: sales, values: contact.salesEmail ? [{ text: contact.salesEmail, href: `mailto:${contact.salesEmail}` }] : [] },
    {
      id: "operations-email",
      icon: Wrench,
      label: operations,
      values: contact.operationsEmail ? [{ text: contact.operationsEmail, href: `mailto:${contact.operationsEmail}` }] : [],
    },
    { id: "hours", icon: Clock, label: hours, values: contact.hours ? [{ text: contact.hours }] : [] },
    { id: "address", icon: MapPin, label: visit, values: contact.address ? [{ text: addressLines(contact.address).join(", ") }] : [] },
  ];
  return rows.filter((row) => row.values.length > 0);
}

/** An email address may wrap only after its "@", never mid-word. */
function Wrappable({ text }: { text: string }) {
  const at = text.indexOf("@");
  if (at < 1) return text;
  return (
    <>
      {text.slice(0, at + 1)}
      <wbr />
      {text.slice(at + 1)}
    </>
  );
}

/** A contact value: a link when it has one (WhatsApp opens in a new tab), plain text otherwise. */
export function ContactLink({ value, className }: { value: ContactValue; className?: string }) {
  if (!value.href) return <span className={className}>{value.text}</span>;
  return (
    <a
      href={value.href}
      className={className}
      {...(value.external ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${value.text} on WhatsApp (opens in a new tab)` } : {})}
    >
      <Wrappable text={value.text} />
    </a>
  );
}

/**
 * The contact details as a compact list, for the navigation's contact panel and the phone contact sheet: one row
 * per channel, icon first, every number and address tappable.
 */
export function ContactList({
  contact,
  labels,
  only,
  className,
}: {
  contact: SiteContact;
  labels?: ContactLabels;
  only?: string[];
  className?: string;
}) {
  const rows = contactRows(contact, labels).filter((row) => !only || only.includes(row.id));
  return (
    <ul className={cn("grid gap-0.5", className)}>
      {rows.map(({ id, icon: Icon, label, values }) => (
        <li key={id} className="flex min-w-0 items-start gap-3 rounded-card-sm px-3 py-2.5">
          <span aria-hidden className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", id === "hotline" ? "bg-deep text-white" : "bg-tint-2 text-deep")}>
            <Icon className="size-4" strokeWidth={1.9} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-muted">{label}</span>
            <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-[15px] font-medium text-ink">
              {values.map((value) => (
                <ContactLink
                  key={value.text}
                  value={value}
                  className={cn("min-w-0", value.href && "transition-colors hover:text-deep hover:underline hover:decoration-brand hover:underline-offset-4")}
                />
              ))}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
