import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { PixelCluster } from "@/components/ui/decor";
import { Pill } from "@/components/ui/pill";
import { photos } from "@/content/images";

/**
 * Closing call to action: the reference "gallery" arch, holding an oval photo with a round button.
 * It tucks under the footer's rounded corners, so place it last on a page.
 */
export function ArchCta({
  eyebrow = "Find my solution",
  title = (
    <>
      Need help choosing?
      <br className="hidden sm:block" /> We’ll recommend the right system.
    </>
  ),
  description = "Tell us your location, water source, customer type and preferred solution. LUSAKO recommends the appropriate system.",
  href = "/find-my-solution",
  buttonLabel = "Find my solution",
  image = photos.corporateTeam,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  href?: string;
  buttonLabel?: string;
  image?: { src: StaticImageData; alt: string };
}) {
  return (
    <section data-arch className="relative -mb-14 overflow-hidden pt-14 lg:pt-20">
      <Container className="relative flex flex-col items-center text-center">
        <Pill>{eyebrow}</Pill>
        <h2 className="mt-5 max-w-3xl text-h2 font-medium text-ink">{title}</h2>
        <p className="mt-5 max-w-xl text-muted">{description}</p>
      </Container>

      <div className="relative mt-12 lg:mt-16">
        <div
          aria-hidden
          data-arch-shape
          className="absolute inset-x-[-25%] top-0 bottom-0 rounded-t-[50%] bg-pastel sm:inset-x-[-8%]"
        />
        <PixelCluster className="absolute top-[16%] left-[6%] size-10 sm:size-14" />
        <PixelCluster variant="b" className="absolute top-[8%] right-[12%] size-10 sm:size-12" />
        <PixelCluster className="absolute right-[4%] bottom-[30%] hidden size-12 sm:block" />
        <PixelCluster variant="b" className="absolute bottom-[22%] left-[3%] hidden size-10 lg:block" />
        <Container className="relative pt-16 pb-32 sm:pt-24 lg:pb-40">
          <div data-arch-media className="relative mx-auto aspect-[4/3] max-w-4xl overflow-hidden rounded-[999px] sm:aspect-[2/1]">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 896px, 90vw" className="object-cover" />
            <Link
              href={href}
              className="absolute top-1/2 left-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white p-4 text-center text-xs leading-tight font-semibold tracking-[0.12em] text-ink uppercase shadow-float transition-transform duration-300 ease-emph hover:scale-105 sm:size-32 sm:text-[13px]"
            >
              {buttonLabel}
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
}
