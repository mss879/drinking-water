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
import { chromeActionBar, chromeContactLabels, chromeContactMenu, chromeMobileMenu, chromeSite, chromeWhatsappButton } from "@/content/copy/chrome";
import { amcOptionLabels, productOptions } from "@/content/forms";
import { getAmc, getCopy, getProducts, getSiteSettings } from "@/lib/cms/content";
import { JsonLd } from "@/lib/jsonld";
import { localBusinessJsonLd } from "@/lib/local-business";

/**
 * Everything around a marketing page: the home intro, the floating navigation, the footer, the mobile action bar,
 * WhatsApp, the motion engine and smooth scrolling. The `(site)` layout and the root 404 both render it; the admin
 * has its own shell. The chrome's wording is read here (content/copy/chrome.ts) and handed to the client parts.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [{ contact, social }, products, seo, contactMenu, mobileMenu, { labels }, actionBar, whatsapp, amc] = await Promise.all([
    getSiteSettings(),
    getProducts(),
    getCopy(chromeSite),
    getCopy(chromeContactMenu),
    getCopy(chromeMobileMenu),
    getCopy(chromeContactLabels),
    getCopy(chromeActionBar),
    getCopy(chromeWhatsappButton),
    getAmc(),
  ]);

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
      <Header contact={contact} social={social} copy={{ contactMenu, mobileMenu, contactLabels: labels }} />
      <main id="main" className="flex-1">
        <CatalogProvider options={productOptions(products)} labels={amcOptionLabels(amc.plans)}>
          {children}
        </CatalogProvider>
      </main>
      <Footer />
      <MobileCtaBar contact={contact} social={social} copy={actionBar} labels={labels} />
      <WhatsAppButton contact={contact} label={whatsapp.label} />
      <MotionRoot />
      <SmoothScroll />
      <JsonLd data={localBusinessJsonLd(contact, social, seo.description)} />
      <Analytics />
      <Tracker />
    </>
  );
}
