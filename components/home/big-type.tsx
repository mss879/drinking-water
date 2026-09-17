import Image from "next/image";
import { Container } from "@/components/ui/container";
import { PixelCluster } from "@/components/ui/decor";
import { photos } from "@/content/images";

/**
 * Giant outline word + round photo + giant solid word (reference "GREEN ◯ CAMPAIGN").
 * Sized to fit the container at every width (stacked on phones); on scroll the words slide in from
 * either side and meet while the photo spins into place (components/motion/motion-root.tsx).
 */
export function BigType() {
  return (
    <section aria-label="Pure hydration" data-bigtype className="relative overflow-hidden py-14 lg:py-20">
      <PixelCluster className="absolute top-6 left-5 size-9 sm:top-1/2 sm:left-4 sm:size-11 sm:-translate-y-1/2 lg:size-14" />
      <PixelCluster variant="b" className="absolute right-5 bottom-5 size-9 sm:right-8 lg:size-14" />
      <Container>
        <p className="flex flex-col items-center gap-[0.14em] text-[length:clamp(3.1rem,15vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.045em] whitespace-nowrap uppercase sm:flex-row sm:justify-center sm:gap-[0.2em] sm:text-[length:clamp(3rem,8.4vw,10.25rem)]">
          <span className="flex items-center gap-[0.2em]">
            <span data-bigtype-left className="text-outline [--outline-w:2px]">
              Pure
            </span>
            <span data-bigtype-orb className="relative block size-[1.2em] shrink-0 rounded-full border border-line p-[0.07em]">
              <span className="relative block size-full overflow-hidden rounded-full">
                <Image
                  src={photos.waterPour.src}
                  alt={photos.waterPour.alt}
                  fill
                  sizes="(min-width: 1024px) 180px, 25vw"
                  data-no-parallax
                  className="scale-[1.12] object-cover"
                />
              </span>
            </span>
          </span>
          <span data-bigtype-right className="text-ink">
            Hydration
          </span>
        </p>
      </Container>
    </section>
  );
}
