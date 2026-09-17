import type { Metadata } from "next";
import { BigType } from "@/components/home/big-type";
import { ChooseYourWay } from "@/components/home/choose-your-way";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { Trust } from "@/components/home/trust";
import { ArchCta } from "@/components/sections/arch-cta";
import { BuyVsRent } from "@/components/sections/buy-vs-rent";
import { FaqSection } from "@/components/sections/faq-section";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PurificationChooser } from "@/components/sections/purification-chooser";
import { RentalInclusions } from "@/components/sections/rental-inclusions";
import { Marquee } from "@/components/ui/marquee";
import { homeFaqs } from "@/content/faqs";
import { site } from "@/content/site";
import { JsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "LUSAKO | Pure Water Without the Hassle",
  description:
    "Bottleless water purification and hydration solutions for homes, offices and businesses in Sri Lanka. Buy a LUSAKO purifier, rent for your office, or get a corporate hydration solution.",
  path: "/",
  absolute: true,
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url, description: site.description }} />
      <Hero />
      {/* The rest of the page slides up over the hero film as one rounded sheet (the hero timeline and the
          header key off data-hero-cover), so the film never shows through behind later sections. */}
      <div
        data-hero-cover
        className="relative z-10 -mt-8 rounded-t-[2rem] bg-white shadow-[0_-32px_64px_-40px_rgb(6_20_43/0.55)] motion-safe:-mt-[100lvh] lg:rounded-t-[3rem]"
      >
        <ChooseYourWay />
        <BigType />
        <PurificationChooser />
        <FeaturedProducts />
        <Marquee
          items={[
            "Better water. Better way.",
            "Buy it. Rent it. We take care of it.",
            "Bottleless hydration",
            "UF & RO purification",
            "Professional installation",
            "Preventive maintenance",
          ]}
        />
        <RentalInclusions />
        <BuyVsRent />
        <Trust />
        <HowItWorks />
        <FaqSection faqs={homeFaqs} />
        <ArchCta />
      </div>
    </>
  );
}
