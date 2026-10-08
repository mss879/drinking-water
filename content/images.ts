/**
 * The website's images — AI-generated with Higgsfield for the design build, shown in black & white. These are the
 * defaults: the admin's Website images section replaces any of them (client, October 2026: "Replace website images
 * — control panel to edit and upload"). Product photos, part photos, client logos and blog covers have their own
 * sections.
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

/** Lifestyle photos (the client's photos 1–6), then the page headers. Saved replacements are keyed by these names. */
export const photoKeys = [
  "officePantry",
  "corporateTeam",
  "heroHome",
  "careTechnician",
  "waterTest",
  "waterPour",
  "pageAbout",
  "pageAmc",
  "pageBlog",
  "pageClients",
  "pageContact",
  "pageFaq",
  "pageFunctionalWater",
  "pageHydration",
  "pageParts",
  "pageWhy",
] as const;
export type PhotoKey = (typeof photoKeys)[number];
export type Photos = Record<PhotoKey, Photo>;

/**
 * The `page…` images open one inner page each, so no two pages open on the same picture (Higgsfield gpt_image_2_5,
 * October 2026). Minimal black & white still lifes: the subject sits on the right and the left half stays near-black,
 * where the hero's text runs. They're decoration, so they carry no description. Pages without one open on a lifestyle
 * photo, each used by one hero only.
 */
export const photos: Photos = {
  heroHome: { src: heroHome, alt: "A mother and daughter filling glasses from a countertop water purifier in a bright kitchen" },
  officePantry: { src: officePantry, alt: "Colleagues in an office pantry filling a bottle from a freestanding water purifier" },
  careTechnician: { src: careTechnician, alt: "A LUSAKO technician replacing a filter inside a water purifier" },
  corporateTeam: { src: corporateTeam, alt: "An office team sharing glasses of purified water around a freestanding purifier" },
  waterTest: { src: waterTest, alt: "A technician testing a glass of water with a digital TDS meter" },
  waterPour: { src: waterPour, alt: "Pure water being poured into a glass" },
  pageAbout: { src: aboutHero, alt: "" },
  pageAmc: { src: amcHero, alt: "" },
  pageBlog: { src: blogHero, alt: "" },
  pageClients: { src: clientsHero, alt: "" },
  pageContact: { src: contactHero, alt: "" },
  pageFaq: { src: faqHero, alt: "" },
  pageFunctionalWater: { src: functionalHero, alt: "" },
  pageHydration: { src: hydrationHero, alt: "" },
  pageParts: { src: partsHero, alt: "" },
  pageWhy: { src: whyHero, alt: "" },
};

export type PhotoGroup = "page" | "lifestyle";

/**
 * What each image is called in the admin and where it appears, so a replacement goes to the right place. Lifestyle
 * photos keep the client's numbering (photos 1–4 in "LUSAKO Website changes"); page headers are listed by page.
 */
export const photoSlots: Record<PhotoKey, { group: PhotoGroup; number: number; title: string; usedOn: string }> = {
  officePantry: { group: "lifestyle", number: 1, title: "Office pantry", usedOn: "Rental (top of the page), Hydration solutions, About, Why LUSAKO" },
  corporateTeam: { group: "lifestyle", number: 2, title: "Corporate team", usedOn: "Corporate hydration (top of the page), Hydration solutions, About, Why LUSAKO" },
  heroHome: { group: "lifestyle", number: 3, title: "Home kitchen", usedOn: "Hydration solutions, About, Why LUSAKO" },
  careTechnician: { group: "lifestyle", number: 4, title: "Service technician", usedOn: "Service & support (top of the page), Hydration solutions, Why LUSAKO" },
  waterTest: { group: "lifestyle", number: 5, title: "Water test", usedOn: "Find my solution (top of the page), Home, Rental, Water purifiers" },
  waterPour: { group: "lifestyle", number: 6, title: "Water pour", usedOn: "Water purifiers (top of the page), About" },
  pageAbout: { group: "page", number: 7, title: "About LUSAKO", usedOn: "Top of the About page" },
  pageWhy: { group: "page", number: 8, title: "Why LUSAKO", usedOn: "Top of the Why LUSAKO page" },
  pageHydration: { group: "page", number: 9, title: "Hydration solutions", usedOn: "Top of the Hydration solutions page" },
  pageFunctionalWater: { group: "page", number: 10, title: "Functional water", usedOn: "Top of the Functional water page" },
  pageAmc: { group: "page", number: 11, title: "AMC plans", usedOn: "Top of the AMC plans page" },
  pageParts: { group: "page", number: 12, title: "Filters, parts & accessories", usedOn: "Top of the Filters, parts & accessories page" },
  pageClients: { group: "page", number: 13, title: "Our clients", usedOn: "Top of the Our clients page" },
  pageBlog: { group: "page", number: 14, title: "Blog", usedOn: "Top of the Blog page, and articles without a cover photo" },
  pageFaq: { group: "page", number: 15, title: "FAQs", usedOn: "Top of the FAQs page" },
  pageContact: { group: "page", number: 16, title: "Contact", usedOn: "Top of the Contact page" },
};

/**
 * 3D centrepiece: a liquid-water ribbon looping into an infinity sign (Higgsfield gpt_image_2_5, then locked to
 * the brand sheet's blue strip with scripts/brand-recolor.py). Decorative wherever it appears.
 */
export const waterRibbon = { src: waterRibbonImage, alt: "" };
