import { site, type SiteContact, type SocialLink } from "@/content/site";
import { addressLines, telHref } from "@/lib/contact";
import { organizationId, websiteId } from "@/lib/seo";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "8.30 AM" → "08:30". */
function clock(hours: string, minutes: string, meridiem: string) {
  let hour = Number(hours) % 12;
  if (/pm/i.test(meridiem)) hour += 12;
  return `${String(hour).padStart(2, "0")}:${minutes}`;
}

/**
 * Opening hours as structured data, read from the hours the admin writes ("Monday to Friday, 8.30 AM – 5.30 PM").
 * Anything in another shape is left out rather than guessed.
 */
export function openingHours(text: string) {
  const match =
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(?:to|-|–|—)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*(\d{1,2})[.:](\d{2})\s*(am|pm)\s*(?:to|-|–|—)\s*(\d{1,2})[.:](\d{2})\s*(am|pm)$/i.exec(
      text.trim(),
    );
  if (!match) return null;
  const from = days.findIndex((day) => day.toLowerCase() === match[1].toLowerCase());
  const to = days.findIndex((day) => day.toLowerCase() === match[2].toLowerCase());
  if (to < from) return null;
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: days.slice(from, to + 1),
    opens: clock(match[3], match[4], match[5]),
    closes: clock(match[6], match[7], match[8]),
  };
}

/** The address lines as a PostalAddress. Colombo's numbered districts carry their postcode ("Colombo 08" is 00800). */
export function postalAddress(address: string) {
  const lines = addressLines(address).filter((line) => !/^sri lanka$/i.test(line));
  if (!lines.length) return null;
  const district = /^colombo\s*0?(\d{1,2})(?:00)?$/i.exec(lines[1] ?? "");
  return {
    "@type": "PostalAddress",
    streetAddress: lines[0],
    ...(district
      ? { addressLocality: "Colombo", postalCode: `${district[1].padStart(3, "0")}00` }
      : lines[1]
        ? { addressLocality: lines[1] }
        : {}),
    addressRegion: "Western Province",
    addressCountry: "LK",
  };
}

const e164 = (number: string) => telHref(number).slice(4);

/** LUSAKO as a local business, on every public page. Services, products and articles point at it by id. */
export function localBusinessJsonLd(contact: SiteContact, social: SocialLink[]) {
  const address = postalAddress(contact.address);
  const hours = openingHours(contact.hours);
  const logo = new URL("/brand/lusako-logo.png", site.url).toString();
  return [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": organizationId,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      logo,
      image: new URL("/og", site.url).toString(),
      slogan: site.tagline,
      description: site.description,
      ...(contact.phones[0] ? { telephone: e164(contact.phones[0]) } : {}),
      ...(contact.salesEmail ? { email: contact.salesEmail } : {}),
      ...(address ? { address } : {}),
      ...(hours ? { openingHoursSpecification: [hours] } : {}),
      areaServed: { "@type": "Country", name: "Sri Lanka" },
      contactPoint: [
        ...contact.phones.slice(0, 1).map((phone) => ({
          "@type": "ContactPoint",
          telephone: e164(phone),
          ...(contact.salesEmail ? { email: contact.salesEmail } : {}),
          contactType: "sales",
          areaServed: "LK",
        })),
        ...(contact.hotline
          ? [
              {
                "@type": "ContactPoint",
                telephone: e164(contact.hotline),
                ...(contact.operationsEmail ? { email: contact.operationsEmail } : {}),
                contactType: "technical support",
                areaServed: "LK",
              },
            ]
          : []),
      ],
      ...(social.length ? { sameAs: social.map((link) => link.url) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: "en-LK",
      publisher: { "@id": organizationId },
    },
  ];
}
