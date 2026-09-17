import { ImageResponse } from "next/og";
import { logoColors, wordmark } from "@/content/brand-logo";

export const dynamic = "force-static";

/** Shared social card, referenced by every page's metadata (lib/seo.ts). */
export function GET() {
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
          background: "linear-gradient(180deg, #FFFFFF 0%, #EEF5FE 100%)",
          color: "#0A1F3D",
        }}
      >
        <div style={{ display: "flex" }}>
          <svg width={236} height={Math.round((236 * wordmark.height) / wordmark.width)} viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}>
            <path fill={logoColors.blue} d={wordmark.d} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", fontSize: 96, lineHeight: 1.08, letterSpacing: -3 }}>
            <span style={{ background: "#DDEBFC", borderRadius: 999, padding: "0 28px", marginRight: 22 }}>Pure water</span>
            <span>without the hassle</span>
          </div>
          <div style={{ fontSize: 32, color: "#4B5D75" }}>
            Water purification and hydration solutions for homes, offices and businesses in Sri Lanka.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 6, color: "#1B66C9" }}>
          <span>BUY • RENT • HYDRATE • CARE</span>
          <span style={{ letterSpacing: 1, color: "#4B5D75" }}>drinkingwater.lk</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
