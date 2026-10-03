/**
 * Lifestyle photography — AI-generated with Higgsfield for the design build, shown in black & white.
 * These are the defaults: the admin's Site photos section replaces any of them.
 * TODO(client): LUSAKO is sending its own photos, numbered to match `photoSlots` below.
 */
import type { StaticImageData } from "next/image";
import heroHome from "@/public/images/hero-home.jpg";
import officePantry from "@/public/images/office-pantry.jpg";
import careTechnician from "@/public/images/care-technician.jpg";
import corporateTeam from "@/public/images/corporate-team.jpg";
import waterTest from "@/public/images/water-test.jpg";
import waterPour from "@/public/images/water-pour.jpg";
import waterRibbonImage from "@/public/images/3d/water-ribbon.webp";
import aboutHero from "@/public/images/heroes/about-glass.jpg";
import amcHero from "@/public/images/heroes/amc-technician.jpg";
import blogHero from "@/public/images/heroes/blog-notebook.jpg";
import clientsHero from "@/public/images/heroes/clients-building.jpg";
import contactHero from "@/public/images/heroes/contact-phone.jpg";
import faqHero from "@/public/images/heroes/faq-ripple.jpg";
import functionalHero from "@/public/images/heroes/functional-sparkling.jpg";
import hydrationHero from "@/public/images/heroes/hydration-carafe.jpg";
import partsHero from "@/public/images/heroes/parts-cartridges.jpg";
import whyHero from "@/public/images/heroes/why-tap.jpg";

export type Photo = { src: StaticImageData | string; alt: string };

export const photoKeys = ["officePantry", "corporateTeam", "heroHome", "careTechnician", "waterTest", "waterPour"] as const;
export type PhotoKey = (typeof photoKeys)[number];
export type Photos = Record<PhotoKey, Photo>;

export const photos: Photos = {
  heroHome: { src: heroHome, alt: "A mother and daughter filling glasses from a countertop water purifier in a bright kitchen" },
  officePantry: { src: officePantry, alt: "Colleagues in an office pantry filling a bottle from a freestanding water purifier" },
  careTechnician: { src: careTechnician, alt: "A LUSAKO technician replacing a filter inside a water purifier" },
  corporateTeam: { src: corporateTeam, alt: "An office team sharing glasses of purified water around a freestanding purifier" },
  waterTest: { src: waterTest, alt: "A technician testing a glass of water with a digital TDS meter" },
  waterPour: { src: waterPour, alt: "Pure water being poured into a glass" },
};

/**
 * What each photo is called in the admin, in the client's numbering (photos 1–4 in "LUSAKO Website changes"), and
 * where it appears, so a replacement goes to the right place.
 */
export const photoSlots: Record<PhotoKey, { number: number; title: string; usedOn: string }> = {
  officePantry: { number: 1, title: "Office pantry", usedOn: "Rental (top of the page), Hydration solutions, About, Why LUSAKO" },
  corporateTeam: { number: 2, title: "Corporate team", usedOn: "Corporate hydration (top of the page), Hydration solutions, About, Why LUSAKO" },
  heroHome: { number: 3, title: "Home kitchen", usedOn: "Hydration solutions, About, Why LUSAKO" },
  careTechnician: { number: 4, title: "Service technician", usedOn: "Service & support (top of the page), Hydration solutions, Why LUSAKO" },
  waterTest: { number: 5, title: "Water test", usedOn: "Find my solution (top of the page), Home, Rental, Water purifiers" },
  waterPour: { number: 6, title: "Water pour", usedOn: "Water purifiers (top of the page), About" },
};

/**
 * One hero image per inner page, so no two pages open on the same picture (Higgsfield gpt_image_2_5, October 2026).
 * Minimal black & white still lifes: the subject sits on the right and the left half stays near-black, where the
 * hero's text runs. Pages not listed here open on one of the lifestyle photos above, each used by one hero only.
 */
export const heroImages = {
  about: aboutHero,
  amc: amcHero,
  blog: blogHero,
  clients: clientsHero,
  contact: contactHero,
  faq: faqHero,
  functionalWater: functionalHero,
  hydration: hydrationHero,
  parts: partsHero,
  why: whyHero,
} satisfies Record<string, StaticImageData>;

/**
 * 3D centrepiece: a liquid-water ribbon looping into an infinity sign (Higgsfield gpt_image_2_5, then locked to
 * the brand sheet's blue strip with scripts/brand-recolor.py). Decorative wherever it appears.
 */
export const waterRibbon = { src: waterRibbonImage, alt: "" };
