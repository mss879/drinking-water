import type { Metadata } from "next";
import { BigType } from "@/components/home/big-type";
import { ChooseYourWay } from "@/components/home/choose-your-way";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FunctionalWater } from "@/components/home/functional-water";
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
import { getClientLogos, getProducts } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "LUSAKO | Water Purifiers & Office Water Rental, Sri Lanka",
  description:
    "Bottleless water purifiers for homes, offices and businesses in Sri Lanka. Buy a LUSAKO purifier, rent for your office, or get a corporate hydration solution.",
  path: "/",
  absolute: true,
});

export default async function HomePage() {
  const [products, logos] = await Promise.all([getProducts(), getClientLogos()]);

  return (
    <>
      <Hero />
      <Problems />
      <StatsBand />
      <ChooseYourWay featured={products.find((product) => product.types.includes("countertop")) ?? products[0]} />
      <RentalInclusions />
      <PurificationChooser />
      <BigType />
      <FunctionalWater />
      <FeaturedProducts products={products} />
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
      <Trust logos={logos} />
      <HowItWorks />
      <FaqSection faqs={homeFaqs} />
      <CtaBand />
    </>
  );
}
