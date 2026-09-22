import Image from "next/image";
import { SITE } from "@/content/site";
import { findStock } from "@/content/images";
import { blurProps, findImages, imageSrc, stockSrc } from "@/lib/images";
import { Reveal } from "@/components/motion/reveal";

const about = SITE.sections.find((s) => s.id === "about")!;

/**
 * Section 01, Pin 2. The Nashville skyline runs full width behind the
 * section and drifts as it passes; the copy sits on a frosted card held
 * to the right, and the heading straddles that card's left edge, half
 * over the glass and half over the open photograph.
 *
 * The tint is heavier here than on the other bands (0.65 rather than
 * 0.35) because the heading has to clear AA on the bare photo, not only
 * on the card. Measured against the darkest pixel the overhang can land
 * on: chestnut reads 3.63:1 there and 6.45:1 on the card, and the body
 * copy reads 7.39:1. A lighter veil drops the overhang under 3:1.
 *
 * The backdrop is a fixed landscape band rather than the full height of
 * the section. The section runs about 1150px tall at 1280 and the photo
 * is 16:9, so covering the whole of it would crop a 3200x1800 frame to
 * near square. The band is sized close to the photo's own ratio at both
 * breakpoints instead: 390x216 on the phone, 1265x640 from md. The card
 * carries on past its lower edge onto the ground, and the portrait sits
 * below the band rather than straddling it.
 *
 * Grid placement uses col-start / col-end longhands on purpose: the card,
 * the portrait and the margin word share one row and overlap, and
 * col-span at a breakpoint would reset the start line.
 */
export function AboutSection() {
  const portrait = findImages("about", "headshots")[1];
  const backdrop = findStock("nashville");

  return (
    <section
      id="about"
      className="relative isolate scroll-mt-14 border-t border-rule py-section"
    >
      <div className="drift-frame absolute inset-x-0 top-0 -z-20 h-[13.5rem] overflow-hidden rounded-card md:h-[40rem] lg:h-[44rem]">
        <div className="drift absolute inset-x-0 -top-[6%] h-[112%]">
          <Image
            src={stockSrc(backdrop)}
            alt={backdrop.alt}
            fill
            sizes="100vw"
            loading="lazy"
            decoding="async"
            {...blurProps(backdrop)}
            className="object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-ground/65 dark:bg-espresso/70"
        />
      </div>

      <div className="frame">
        <div className="mt-[7rem] grid gap-stack md:mt-0 md:grid-cols-12">
          <div
            aria-hidden="true"
            className="hidden md:col-start-1 md:col-end-2 md:row-start-1 md:flex md:items-center md:justify-center"
          >
            <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap font-display type-h1 uppercase tracking-[0.2em] text-ink-soft">
              {about.number} &mdash; {about.title}
            </span>
          </div>

          <Reveal
            className="glass rounded-card px-gutter py-block md:col-start-7 md:col-end-13 md:row-start-1 md:self-start"
          >
            <p className="eyebrow text-ink-soft md:hidden">
              {about.number} &mdash; {about.title}
            </p>
            {/* The Pin 2 move. The negative start margin pulls the
                heading out past the card's left edge, so roughly half of
                it sits on the open photograph. The card's overflow is
                visible, which is what lets it escape. */}
            <h2 className="relative type-display md:-ml-[60%] md:type-display-xl md:whitespace-nowrap">
              {about.title}
            </h2>
            {about.blurb ? (
              <p className="mt-stack type-lead">{about.blurb}</p>
            ) : null}
            <p className="mt-stack max-w-prose">{about.body}</p>
          </Reveal>

          <Reveal
            delay={90}
            variant="mask"
            className="photo-card aspect-[4/5] w-full bg-placeholder max-md:bleed md:col-start-2 md:col-end-6 md:row-start-1 md:self-end"
          >
            {portrait ? (
              <Image
                src={imageSrc(portrait)}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                sizes="(min-width: 768px) 30vw, 100vw"
                {...blurProps(portrait)}
                className="size-full object-cover"
              />
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
