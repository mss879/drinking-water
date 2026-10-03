import { ImageResponse } from "next/og";
import { wavePath } from "@/components/ui/decor";
import { logoColors, wordmark } from "@/content/brand-logo";

/** Brand sheet colours as literals: next/og can't read CSS variables (DESIGN.md › Palette). */
const brand = { blue: "#278CF0", deep: "#0055A8", mist: "#9DC4DF", ink: "#0A0A0D", grey: "#545454", white: "#FFFFFF" };

export const ogSize = { width: 1200, height: 630 };

/**
 * The social card: the wordmark, a two-part headline (blue, then ink), a line of text and a footer, over the brand
 * waves. The site-wide card and each product's card share it.
 */
export function ogCard({
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
              <span style={{ color: brand.blue, fontSize: lead.length > 18 ? 84 : 100, lineHeight: 1.02, letterSpacing: -3, fontWeight: 700 }}>{lead}</span>
              <span style={{ fontSize: rest.length > 34 ? 42 : 50, lineHeight: 1.15, letterSpacing: -1 }}>{rest}</span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: long ? 76 : 100,
                lineHeight: 1.04,
                letterSpacing: long ? -2 : -3,
                fontWeight: 700,
                maxWidth: 1040,
              }}
            >
              <span style={{ color: brand.blue }}>{lead}</span>
              <span>{rest}</span>
            </div>
          )}
          <div style={{ fontSize: product ? 28 : 30, color: brand.grey, maxWidth: 1056 }}>{text}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 6, color: brand.deep, paddingBottom: 36 }}>
          <span>{footer}</span>
          <span style={{ letterSpacing: 1, color: brand.grey }}>drinkingwater.lk</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
