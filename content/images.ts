/**
 * Lifestyle photography — AI-generated with Higgsfield for the design build.
 * TODO(client): swap for approved LUSAKO installation photography where available (brief §10, §16).
 */
import heroHome from "@/public/images/hero-home.jpg";
import officePantry from "@/public/images/office-pantry.jpg";
import careTechnician from "@/public/images/care-technician.jpg";
import corporateTeam from "@/public/images/corporate-team.jpg";
import waterTest from "@/public/images/water-test.jpg";
import waterPour from "@/public/images/water-pour.jpg";
import waterRibbonImage from "@/public/images/3d/water-ribbon.webp";

export const photos = {
  heroHome: { src: heroHome, alt: "A mother and daughter filling glasses from a countertop water purifier in a bright kitchen" },
  officePantry: { src: officePantry, alt: "Colleagues in an office pantry filling a bottle from a freestanding water purifier" },
  careTechnician: { src: careTechnician, alt: "A LUSAKO technician replacing a filter inside a water purifier" },
  corporateTeam: { src: corporateTeam, alt: "An office team sharing glasses of purified water around a freestanding purifier" },
  waterTest: { src: waterTest, alt: "A technician testing a glass of water with a digital TDS meter" },
  waterPour: { src: waterPour, alt: "Pure water being poured into a glass" },
};

/**
 * 3D centrepiece: a liquid-water ribbon looping into an infinity sign (Higgsfield gpt_image_2_5, then locked to
 * the brand sheet's blue strip with scripts/brand-recolor.py). Decorative wherever it appears.
 */
export const waterRibbon = { src: waterRibbonImage, alt: "" };
