import type { ReactNode } from "react";
import { Tracker } from "@/components/analytics/tracker";
import { CatalogProvider } from "@/components/forms/catalog-context";
import { Analytics } from "@/components/layout/analytics";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { MotionRoot } from "@/components/motion/motion-root";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { introScript } from "@/components/preloader/intro-script";
import { Preloader } from "@/components/preloader/preloader";
import { productOptions } from "@/content/forms";
import { getProducts, getSiteSettings } from "@/lib/cms/content";
import { JsonLd } from "@/lib/jsonld";
import { localBusinessJsonLd } from "@/lib/local-business";

/**
 * Everything around a marketing page: the home intro, the floating navigation, the footer, the mobile action bar,
 * WhatsApp, the motion engine and smooth scrolling. The `(site)` layout and the root 404 both render it; the admin
 * has its own shell.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [{ contact, social }, products] = await Promise.all([getSiteSettings(), getProducts()]);

  return (
    <>
      {/* Runs before the first paint so the home intro can cover the page from the first frame. */}
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <Preloader />
      <a
        href="#main"
        className="sr-only rounded-full bg-deep px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <Header contact={contact} social={social} />
      <main id="main" className="flex-1">
        <CatalogProvider options={productOptions(products)}>{children}</CatalogProvider>
      </main>
      <Footer />
      <MobileCtaBar contact={contact} social={social} />
      <WhatsAppButton number={contact.whatsappSales} />
      <MotionRoot />
      <SmoothScroll />
      <JsonLd data={localBusinessJsonLd(contact, social)} />
      <Analytics />
      <Tracker />
    </>
  );
}
