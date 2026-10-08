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
import { homeHero, homeMarquee, homePromise, homeSeo } from "@/content/copy/home";
import { findProduct } from "@/content/products";
import { getClientLogos, getCopy, getFaqs, getPicks, getPricing, getProducts } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCopy(homeSeo);
  return pageMetadata({ title: seo.title, description: seo.description, path: "/", absolute: true });
}

export default async function HomePage() {
  const [products, logos, hero, promise, marquee, faqs, picks, pricing] = await Promise.all([
    getProducts(),
    getClientLogos(),
    getCopy(homeHero),
    getCopy(homePromise),
    getCopy(homeMarquee),
    getFaqs(),
    getPicks(),
    getPricing(),
  ]);
  // The Buy card's purifier: the one picked in the admin while it's in the catalogue, else the first countertop one.
  const featured =
    (picks.homeBuyCard ? findProduct(products, picks.homeBuyCard) : undefined) ??
    products.find((product) => product.types.includes("countertop")) ??
    products[0];

  return (
    <>
      <Hero copy={hero} />
      <Problems />
      <StatsBand copy={promise} />
      <ChooseYourWay featured={featured} />
      <RentalInclusions />
      <PurificationChooser />
      <BigType />
      <FunctionalWater />
      <FeaturedProducts products={products} showPrices={pricing.showOnHome} />
      <Marquee items={marquee.phrases} />
      <BuyVsRent />
      <Trust logos={logos} />
      <HowItWorks />
      <FaqSection faqs={faqs.filter((faq) => faq.home)} />
      <CtaBand />
    </>
  );
}
