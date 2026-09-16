import Image from "next/image";
import { SITE } from "@/content/site";
import { findImages, imageSrc } from "@/lib/images";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { LinkedInButton } from "@/components/linkedin-button";

/**
 * Hero. The name is a graphic object: caps roman with the last word
 * dropped into italic, run across the seam of an arch-framed portrait.
 *
 * Light: the name sits on top and its last letters cross the arch, where
 * the photograph is pale. Dark: rose would not read over a bright photo,
 * so the layers swap and the portrait crops the name instead. Both are
 * moves the style guide sanctions.
 *
 * Grid placement uses col-start / col-end longhands on purpose: items in
 * a shared row must all be placed explicitly, and col-span at a
 * breakpoint would reset the start line.
 */
export function Hero() {
  const portrait = findImages("about", "headshots")[0];
  const words = SITE.hero.name.trim().split(/\s+/);
  const lastWord = words[words.length - 1];
  const firstWords = words.slice(0, -1).join(" ");

  return (
    <header className="frame pt-6 pb-section md:pt-10">
      <Reveal
        as="div"
        className="grid grid-cols-12 grid-rows-[auto_auto_auto_auto] md:grid-rows-[auto_auto_1fr]"
      >
        <p className="eyebrow col-start-1 col-end-13 row-start-1 text-ink-soft md:col-end-8 md:pt-2">
          {SITE.hero.eyebrow}
        </p>

        <h1 className="relative z-10 col-start-1 col-end-13 row-start-2 mt-stack type-display-xl text-accent md:type-display-2xl dark:z-0">
          <span className="block uppercase">{firstWords}</span>{" "}
          <span className="ml-[12%] block italic md:ml-[24%]">{lastWord}</span>
        </h1>

        {portrait ? (
          <Parallax className="arch relative col-start-4 col-end-13 row-start-3 -mt-14 aspect-[4/5] self-start bg-placeholder bleed-r md:col-start-9 md:row-start-1 md:row-end-4 md:mt-0 dark:z-10">
            <Image
              src={imageSrc(portrait)}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="(min-width: 768px) 38vw, 80vw"
              loading="eager"
              fetchPriority="high"
              className="size-full object-cover"
            />
          </Parallax>
        ) : null}

        <div className="col-start-1 col-end-13 row-start-4 mt-stack flex flex-col items-start gap-stack md:col-end-7 md:row-start-3 md:mt-block md:self-end">
          <p className="max-w-prose type-lead">{SITE.hero.subline}</p>
          <LinkedInButton />
        </div>
      </Reveal>
    </header>
  );
}
