import type { Metadata, Viewport } from "next";
import { Montserrat, Raleway } from "next/font/google";
import { Analytics } from "@/components/layout/analytics";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { MotionRoot } from "@/components/motion/motion-root";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { introScript } from "@/components/preloader/intro-script";
import { Preloader } from "@/components/preloader/preloader";
import { site } from "@/content/site";
import { JsonLd } from "@/lib/jsonld";
import { ogImage } from "@/lib/seo";
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

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: new URL("/brand/lusako-logo.png", site.url).toString(),
  slogan: site.tagline,
  description: site.description,
  areaServed: { "@type": "Country", name: "Sri Lanka" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: site.contact.phoneDisplay,
    email: site.contact.email,
    contactType: "customer service",
    areaServed: "LK",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The intro script marks <html> before React takes over, hence suppressHydrationWarning.
    <html
      lang="en"
      className={`${raleway.variable} ${montserrat.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <Preloader />
        <a
          href="#main"
          className="sr-only rounded-full bg-deep px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileCtaBar />
        <WhatsAppButton />
        <MotionRoot />
        <SmoothScroll />
        <JsonLd data={organization} />
        <Analytics />
      </body>
    </html>
  );
}
