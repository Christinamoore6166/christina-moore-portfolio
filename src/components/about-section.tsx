import Image from "next/image";
import { SITE } from "@/content/site";
import { findImages, imageSrc } from "@/lib/images";
import { Reveal } from "@/components/motion/reveal";

const about = SITE.sections.find((s) => s.id === "about")!;

/**
 * Section 01. Portrait and running text in an asymmetric two-up, with the
 * section number and title run vertically down the left margin in
 * oversized caps — a device carried over from the reference sites rather
 * than the style guide's usual horizontal eyebrow.
 */
export function AboutSection() {
  const portrait = findImages("about", "headshots")[1];

  return (
    <section
      id="about"
      className="frame scroll-mt-14 border-t border-rule py-section"
    >
      <div className="grid gap-stack md:grid-cols-12 md:items-stretch">
        {portrait ? (
          <Reveal className="max-md:bleed md:col-start-2 md:col-span-5 md:row-start-1 md:bleed-l">
            <div className="hover-zoom aspect-[4/5] w-full bg-placeholder">
              <Image
                src={imageSrc(portrait)}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                sizes="(min-width: 768px) 38vw, 100vw"
                className="size-full object-cover"
              />
            </div>
          </Reveal>
        ) : null}

        <div
          aria-hidden="true"
          className="hidden md:col-start-1 md:row-start-1 md:flex md:items-center md:justify-center"
        >
          <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap font-display type-h1 uppercase tracking-[0.2em] text-ink-soft">
            {about.number} &mdash; {about.title}
          </span>
        </div>

        <Reveal
          delay={90}
          className="flex flex-col gap-stack md:col-start-7 md:col-span-6 md:row-start-1 md:self-center"
        >
          <p className="eyebrow text-ink-soft md:hidden">
            {about.number} &mdash; {about.title}
          </p>
          <h2 className="type-display">{about.title}</h2>
          {about.blurb ? <p className="type-lead">{about.blurb}</p> : null}
          <p className="max-w-prose">{about.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
