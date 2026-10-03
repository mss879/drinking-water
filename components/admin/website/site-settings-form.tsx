"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveContact, saveSocial } from "@/app/actions/admin/website";
import { Field, Input, Textarea } from "@/components/admin/ui/field";
import { Panel } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { TextListEditor } from "@/components/admin/website/list-editors";
import { Button } from "@/components/ui/button";
import { socialLabels, socialNetworks, type SiteContact, type SocialLink, type SocialNetwork } from "@/content/site";

const placeholders: Record<SocialNetwork, string> = {
  linkedin: "https://www.linkedin.com/company/…",
  facebook: "https://www.facebook.com/…",
  instagram: "https://www.instagram.com/…",
  youtube: "https://www.youtube.com/@…",
  tiktok: "https://www.tiktok.com/@…",
};

/** The contact details shown in the header's contact panel, the footer, the Contact page and the phone sheet. */
function ContactForm({ initial }: { initial: SiteContact }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof SiteContact>(key: K, value: SiteContact[K]) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Panel title="Contact details" description="Shown in the menu’s Contact panel, the footer, the Contact page and the phone contact sheet.">
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await saveContact(form);
            if (!result.ok) return toast(result.error, "error");
            toast(result.message ?? "Saved.");
            router.refresh();
          });
        }}
      >
        <TextListEditor
          label="Phone numbers"
          items={form.phones}
          onChange={(items) => set("phones", items)}
          placeholder="011 433 4885"
          max={4}
          addLabel="Add a number"
          hint="Write them the way people dial them; the website makes them tappable."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Emergency breakdown hotline" htmlFor="c-hotline">
            <Input id="c-hotline" inputMode="tel" value={form.hotline} onChange={(event) => set("hotline", event.target.value)} />
          </Field>
          <Field label="WhatsApp: sales" htmlFor="c-wa">
            <Input id="c-wa" inputMode="tel" value={form.whatsappSales} onChange={(event) => set("whatsappSales", event.target.value)} />
          </Field>
          <Field label="WhatsApp: emergency breakdown" htmlFor="c-wae">
            <Input id="c-wae" inputMode="tel" value={form.whatsappEmergency} onChange={(event) => set("whatsappEmergency", event.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sales email" htmlFor="c-sales">
            <Input id="c-sales" type="email" value={form.salesEmail} onChange={(event) => set("salesEmail", event.target.value)} />
          </Field>
          <Field label="Technical & operations email" htmlFor="c-ops">
            <Input id="c-ops" type="email" value={form.operationsEmail} onChange={(event) => set("operationsEmail", event.target.value)} />
          </Field>
        </div>
        <Field label="Opening hours" htmlFor="c-hours" hint="For example Monday to Friday, 8.30 AM – 5.30 PM">
          <Input id="c-hours" value={form.hours} onChange={(event) => set("hours", event.target.value)} />
        </Field>
        <Field label="Address" htmlFor="c-address" hint="One line per row.">
          <Textarea id="c-address" rows={3} className="min-h-24" value={form.address} onChange={(event) => set("address", event.target.value)} />
        </Field>
        <div>
          <Button type="submit" loading={pending}>
            Save contact details
          </Button>
        </div>
      </form>
    </Panel>
  );
}

/** Social media profiles; an icon appears on the website for each one with an address. */
function SocialForm({ initial }: { initial: SocialLink[] }) {
  const router = useRouter();
  const [urls, setUrls] = useState<Record<SocialNetwork, string>>(() =>
    Object.fromEntries(socialNetworks.map((network) => [network, initial.find((link) => link.network === network)?.url ?? ""])) as Record<SocialNetwork, string>,
  );
  const [pending, startTransition] = useTransition();

  return (
    <Panel title="Social media" description="An icon appears in the footer, the Contact page and the contact panel for each profile with an address.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await saveSocial(socialNetworks.map((network) => ({ network, url: urls[network] })));
            if (!result.ok) return toast(result.error, "error");
            toast(result.message ?? "Saved.");
            router.refresh();
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {socialNetworks.map((network) => (
            <Field key={network} label={socialLabels[network]} htmlFor={`s-${network}`}>
              <Input
                id={`s-${network}`}
                type="url"
                inputMode="url"
                placeholder={placeholders[network]}
                value={urls[network]}
                onChange={(event) => setUrls((current) => ({ ...current, [network]: event.target.value }))}
              />
            </Field>
          ))}
        </div>
        <div>
          <Button type="submit" loading={pending}>
            Save social links
          </Button>
        </div>
      </form>
    </Panel>
  );
}

export function SiteSettingsForm({ contact, social }: { contact: SiteContact; social: SocialLink[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-start">
      <ContactForm initial={contact} />
      <SocialForm initial={social} />
    </div>
  );
}
