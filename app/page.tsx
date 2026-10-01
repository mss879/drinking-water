import type { Metadata } from "next";
import { BigType } from "@/components/home/big-type";
import { ChooseYourWay } from "@/components/home/choose-your-way";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { Problems } from "@/components/home/problems";
import { StatsBand } from "@/components/home/stats-band";
import { Trust } from "@/components/home/trust";
import { BuyVsRent } from "@/components/sections/buy-vs-rent";
import { CtaBand } from "@/components/sections/cta-band";
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
      <Problems />
      <StatsBand />
      <ChooseYourWay />
      <RentalInclusions />
      <PurificationChooser />
      <BigType />
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
      <BuyVsRent />
      <Trust />
      <HowItWorks />
      <FaqSection faqs={homeFaqs} />
      <CtaBand />
    </>
  );
}
