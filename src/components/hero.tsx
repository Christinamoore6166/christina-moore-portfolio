import Image from "next/image";
import { SITE } from "@/content/site";
import { blurProps, findImages, imageSrc } from "@/lib/images";
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
 * Entrance: a one-shot sequence of about 1.1s, eyebrow to button, driven
 * by the hero-* classes in globals.css. It replaces the scroll Reveal
 * that used to wrap this block, which fired immediately anyway because
 * the hero is above the fold. The portrait now drifts on a scroll-linked
 * CSS animation rather than the rAF parallax.
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
      <div className="grid grid-cols-12 grid-rows-[auto_auto_auto_auto] md:grid-rows-[auto_auto_1fr]">
        <p className="hero-eyebrow eyebrow col-start-1 col-end-13 row-start-1 text-ink-soft md:col-end-8 md:pt-2">
          {SITE.hero.eyebrow}
        </p>

        <h1 className="relative z-10 col-start-1 col-end-13 row-start-2 mt-stack type-display-xl text-accent md:type-display-2xl dark:z-0">
          <span className="hero-name block uppercase">{firstWords}</span>{" "}
          <span className="hero-accent ml-[12%] block italic md:ml-[24%]">
            {lastWord}
          </span>
        </h1>

        {portrait ? (
          <div className="arch drift-frame relative col-start-4 col-end-13 row-start-3 -mt-14 aspect-[4/5] self-start bg-placeholder bleed-r md:col-start-9 md:row-start-1 md:row-end-4 md:mt-0 dark:z-10">
            {/* The drift wrapper is laid out 12% taller than the arch and
                offset by half of that, so the travel never shows an edge.
                Keeping drift and the unmask on separate elements leaves
                one animation property to each. The arch carries
                drift-frame because it is the clipping box, and the
                timeline has to be measured outside the clip. */}
            <div className="drift absolute inset-x-0 -top-[6%] h-[112%]">
              <Image
                src={imageSrc(portrait)}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                sizes="(min-width: 768px) 38vw, 80vw"
                loading="eager"
                fetchPriority="high"
                {...blurProps(portrait)}
                className="hero-portrait size-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="col-start-1 col-end-13 row-start-4 mt-stack flex flex-col items-start gap-stack md:col-end-7 md:row-start-3 md:mt-block md:self-end">
          <p className="hero-lead max-w-prose type-lead">{SITE.hero.subline}</p>
          <div className="hero-action">
            <LinkedInButton />
          </div>
        </div>
      </div>
    </header>
  );
}
