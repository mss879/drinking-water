import Image from "next/image";
import { Container } from "@/components/ui/container";
import { waterRibbon } from "@/content/images";

/**
 * PURE ∞ HYDRATION: giant outline word + the water ribbon as the infinity sign + giant solid word. Sized from the
 * container's width (cqi) so the row always fits (stacked on phones); on scroll the words slide in from either
 * side and meet while the ribbon turns into place (components/motion/motion-root.tsx).
 */
export function BigType() {
  return (
    <section aria-label="Pure hydration" data-bigtype className="overflow-x-clip py-16 lg:py-24">
      <Container className="@container">
        <p className="flex flex-col items-center gap-[0.1em] font-display text-[length:calc(100cqi/6.7)] leading-[0.9] font-extrabold tracking-[-0.04em] whitespace-nowrap uppercase sm:flex-row sm:justify-center sm:gap-[0.18em] sm:text-[length:calc(100cqi/12)]">
          <span className="flex items-center gap-[0.18em]">
            <span data-bigtype-left className="text-outline [--outline-w:2px]">
              Pure
            </span>
            <span data-bigtype-orb="-28" className="relative block h-[1em] w-[2.24em] shrink-0">
              <Image src={waterRibbon.src} alt="" fill sizes="(min-width: 1024px) 260px, 30vw" className="object-contain drop-shadow-icon" />
            </span>
          </span>
          <span data-bigtype-right className="text-brand">
            Hydration
          </span>
        </p>
      </Container>
    </section>
  );
}
