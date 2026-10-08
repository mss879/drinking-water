import { HowItWorksSteps, type HowItWorksMode } from "@/components/sections/how-it-works-steps";
import { getHowItWorks } from "@/lib/cms/content";

/**
 * Purchase: Choose → Get advice → Install → Own. Rental adds site assessment and ongoing service. Laid out as
 * StomDent's numbered advantages: thin brand-blue numerals strung along a wave that draws itself on scroll. Its
 * wording is the shared block (content/copy/shared.ts); the switch and the steps run in the browser.
 */
export async function HowItWorks({ initial = "buy" }: { initial?: HowItWorksMode }) {
  return <HowItWorksSteps copy={await getHowItWorks()} initial={initial} />;
}
