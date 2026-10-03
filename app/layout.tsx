import type { Metadata, Viewport } from "next";
import { Montserrat, Raleway } from "next/font/google";
import { site } from "@/content/site";
import { isPreviewDeploy, ogImage } from "@/lib/seo";
import "./globals.css";

// Brand sheet type: Raleway for headings, Montserrat for body, UI and figures.
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_LK", images: [ogImage] },
  twitter: { card: "summary_large_image", images: [ogImage.url] },
  formatDetection: { telephone: false, address: false, email: false },
  // Search Console and Bing Webmaster Tools ownership tags, when their codes are set.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
  ...(isPreviewDeploy ? { robots: { index: false, follow: false } } : {}),
};

// The theme colour matches the page canvas (--color-canvas). `viewportFit: "cover"` lets fixed bars read the
// iPhone safe-area insets through env(); containers pad themselves out of the notch in landscape.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6fafe",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The home intro script (components/layout/site-chrome.tsx) marks <html> before React takes over, hence
    // suppressHydrationWarning.
    <html
      lang="en-LK"
      className={`${raleway.variable} ${montserrat.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
