import { ImageResponse } from "next/og";
import { wavePath } from "@/components/ui/decor";
import { logoColors, wordmark } from "@/content/brand-logo";

/** Brand sheet colours as literals: next/og can't read CSS variables (DESIGN.md › Palette). */
const brand = { blue: "#278CF0", deep: "#0055A8", mist: "#9DC4DF", ink: "#0A0A0D", grey: "#545454", white: "#FFFFFF" };

export const ogSize = { width: 1200, height: 630 };

type CardFont = { name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: "normal" };

/**
 * A brand font for the card (DESIGN.md › Typography: Raleway headings, Montserrat text), fetched from Google Fonts with only
 * the letters the card uses, as next/font does for the pages. Cards are drawn at build time and when the admin saves
 * their text; if Google Fonts can't be reached the card still draws, in the built-in font.
 */
async function brandFont(name: "Raleway" | "Montserrat", weight: CardFont["weight"], text: string): Promise<CardFont | null> {
  if (!text) return null;
  try {
    const query = `family=${name}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`, { signal: AbortSignal.timeout(8000) })).text();
    const source = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!source) return null;
    const font = await fetch(source, { signal: AbortSignal.timeout(8000) });
    return font.ok ? { name, data: await font.arrayBuffer(), weight, style: "normal" } : null;
  } catch {
    return null;
  }
}

/**
 * Raleway draws old-style figures and the card can't switch them as the pages do (`lining-nums`), so figures in a
 * heading take Montserrat's lining ones. The renderer drops a space where the font changes, so those stay as
 * no-break spaces.
 */
function lining(text: string) {
  if (!/\d/.test(text)) return text;
  return text
    .split(/(\d+)/)
    .map((part, i) =>
      i % 2 ? <span key={i} style={{ fontFamily: "Montserrat" }}>{part}</span> : part.replace(/^ | $/g, "\u00a0"),
    );
}
const figuresIn = (text: string) => text.replace(/\D/g, "");

/**
 * The social card: the wordmark, a two-part headline (blue, then ink), a line of text and a footer, over the brand
 * waves. The site-wide card and each product's card share it.
 */
export async function ogCard({
  lead,
  rest,
  text,
  footer,
  layout = "statement",
}: {
  lead: string;
  rest: string;
  text: string;
  footer: string;
  /** "statement": two big lines (the site card). "product": the name big, its tagline on one smaller line. */
  layout?: "statement" | "product";
}) {
  const product = layout === "product";
  const long = lead.length + rest.length > 34;
  const domain = "drinkingwater.lk";
  const fonts = (
    await Promise.all([
      brandFont("Raleway", 700, `${product ? lead : lead + rest}\u00a0`),
      brandFont("Raleway", 600, product ? `${rest}\u00a0` : ""),
      brandFont("Montserrat", 500, text + domain),
      brandFont("Montserrat", 600, footer + figuresIn(product ? rest : "")),
      brandFont("Montserrat", 700, figuresIn(product ? lead : lead + rest)),
    ])
  ).filter((font): font is CardFont => font !== null);
  const heading = { fontFamily: "Raleway", fontWeight: 700 } as const;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: brand.white,
          color: brand.ink,
          position: "relative",
        }}
      >
        <svg width={1200} height={220} viewBox="0 0 1440 260" style={{ position: "absolute", left: 0, bottom: -40 }}>
          <path d={wavePath({ width: 1440, y: 150, amplitude: 34, wavelength: 720 })} fill="none" stroke={brand.blue} strokeWidth={3} />
          <path d={wavePath({ width: 1440, y: 185, amplitude: 26, wavelength: 480, phase: 0.3 })} fill="none" stroke={brand.mist} strokeWidth={3} />
          <path d={wavePath({ width: 1440, y: 215, amplitude: 40, wavelength: 1440, phase: 0.6 })} fill="none" stroke={brand.deep} strokeWidth={3} />
        </svg>
        <div style={{ display: "flex" }}>
          <svg width={236} height={Math.round((236 * wordmark.height) / wordmark.width)} viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}>
            <path fill={logoColors.blue} d={wordmark.d} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {product ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 1056 }}>
              <span style={{ ...heading, color: brand.blue, fontSize: lead.length > 18 ? 84 : 100, lineHeight: 1.02, letterSpacing: -2.5 }}>{lining(lead)}</span>
              <span style={{ fontFamily: "Raleway", fontWeight: 600, fontSize: rest.length > 34 ? 42 : 50, lineHeight: 1.15, letterSpacing: -0.5 }}>{lining(rest)}</span>
            </div>
          ) : (
            <div
              style={{
                ...heading,
                display: "flex",
                flexDirection: "column",
                fontSize: long ? 76 : 100,
                lineHeight: 1.04,
                letterSpacing: long ? -1.9 : -2.5,
                maxWidth: 1040,
              }}
            >
              <span style={{ color: brand.blue }}>{lining(lead)}</span>
              <span>{lining(rest)}</span>
            </div>
          )}
          <div style={{ fontFamily: "Montserrat", fontWeight: 500, fontSize: product ? 27 : 29, lineHeight: 1.4, color: brand.grey, maxWidth: 1056 }}>{text}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Montserrat", fontSize: 22, letterSpacing: 5, color: brand.deep, paddingBottom: 36 }}>
          <span style={{ fontWeight: 600 }}>{footer}</span>
          <span style={{ fontWeight: 500, letterSpacing: 0.5, color: brand.grey }}>{domain}</span>
        </div>
      </div>
    ),
    { ...ogSize, ...(fonts.length ? { fonts } : {}) },
  );
}
