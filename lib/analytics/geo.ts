import { countryFromTimeZone } from "@/lib/analytics/timezones";

export type Geo = { country: string | null; region: string | null; city: string | null; source: "header" | "timezone" | null };

const COUNTRY = /^[A-Z]{2}$/;

function decode(value: string | null) {
  if (!value) return null;
  try {
    return decodeURIComponent(value).slice(0, 100) || null;
  } catch {
    return value.slice(0, 100);
  }
}

/**
 * Where a visitor is, from the hosting platform's geo headers. They are only trusted on the platform that sets
 * them (anyone can send an "x-vercel-ip-country" header to a server that isn't on Vercel). Without them the country
 * is estimated from the browser's time zone, and the city stays unknown.
 */
export function readGeo(headers: Headers, timeZone: string | null): Geo {
  let country: string | null = null;
  let region: string | null = null;
  let city: string | null = null;

  if (process.env.VERCEL) {
    country = headers.get("x-vercel-ip-country");
    region = headers.get("x-vercel-ip-country-region");
    city = decode(headers.get("x-vercel-ip-city"));
  } else if (process.env.NETLIFY) {
    try {
      const raw = headers.get("x-nf-geo");
      if (raw) {
        const geo = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as {
          city?: string;
          country?: { code?: string };
          subdivision?: { code?: string };
        };
        country = geo.country?.code ?? null;
        region = geo.subdivision?.code ?? null;
        city = geo.city ?? null;
      }
    } catch {}
  } else if (headers.get("cf-ray")) {
    country = headers.get("cf-ipcountry");
    region = headers.get("cf-region-code");
    city = decode(headers.get("cf-ipcity"));
  }

  country = country?.toUpperCase() ?? null;
  if (country && COUNTRY.test(country) && country !== "XX" && country !== "T1") {
    return { country, region: region?.slice(0, 100) ?? null, city, source: "header" };
  }

  const estimated = countryFromTimeZone(timeZone);
  return estimated ? { country: estimated, region: null, city: null, source: "timezone" } : { country: null, region: null, city: null, source: null };
}
