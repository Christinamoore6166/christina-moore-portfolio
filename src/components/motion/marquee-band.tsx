import { Marquee } from "@/components/motion/marquee";

interface MarqueeBandProps {
  /** The single phrase repeated across the band. */
  text: string;
  className?: string;
  /**
   * "default": the footer's contact line, unchanged. "feature": the
   * section dividers before Branding and Other — taller, uppercase,
   * alternating filled/outlined words, and wipes open on scroll.
   */
  variant?: "default" | "feature";
  /**
   * Feature only. "label" keeps the rose-fill/chestnut-text label
   * pairing (the band before Other). "blush" switches the band to the
   * coral pivot (the band before Branding).
   */
  tone?: "label" | "blush";
}

const REPEATS = 8;

/**
 * A full-bleed band of one phrase repeated and scrolling slowly, used to
 * divide sections. Two identical tracks sit side by side and the pair
 * translates by exactly 50%, so the loop has no visible seam. Holds still
 * under prefers-reduced-motion (see the marquee-track utility) rather than
 * animating: the phrase still reads, it just doesn't move. <Marquee>
 * additionally pauses the scroll while the band is off screen.
 */
export function MarqueeBand({
  text,
  className = "",
  variant = "default",
  tone = "label",
}: MarqueeBandProps) {
  const feature = variant === "feature";
  const blush = feature && tone === "blush";

  /* .text-outline strokes in cream by default, which is right over a
     photo and invisible over these flat warm fills. Each band strokes
     in the warm neighbour of its own fill instead: chestnut on coral
     (4.88:1), terracotta on rose (3.56:1, and these are 75px display
     words, so well past the token's own >=24px limit).

     theme-blush pins its coral in both schemes, but bg-label flips to
     chestnut in dark, where terracotta drops to 1.91:1 and the outline
     all but vanishes. That band swaps to rose on the same condition
     that flips the fill. */
  const outlineStroke = !feature
    ? ""
    : blush
      ? "[--outline-stroke:var(--color-chestnut)]"
      : "[--outline-stroke:var(--color-terracotta)] dark:[--outline-stroke:var(--color-rose)]";

  return (
    <div
      role="separator"
      aria-label={text}
      className={`overflow-hidden border-y border-rule ${
        blush ? "theme-blush bg-page" : "bg-label"
      } ${feature ? "band-in py-6 md:py-10" : "py-4"} ${outlineStroke} ${className}`}
    >
      <Marquee>
        <div
          data-marquee-track
          className="marquee-track flex w-max"
          aria-hidden="true"
        >
          <Track text={text} feature={feature} onPage={blush} />
          <Track text={text} feature={feature} onPage={blush} />
        </div>
      </Marquee>
    </div>
  );
}

function Track({
  text,
  feature,
  onPage,
}: {
  text: string;
  feature: boolean;
  /** True when the surface is theme-blush's bg-page rather than bg-label. */
  onPage: boolean;
}) {
  const words = text.split(" ");
  const textColor = onPage ? "text-ink" : "text-on-label";
  const dividerColor = onPage ? "text-ink/50" : "text-on-label/50";

  return (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: REPEATS }).map((_, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span
            className={`whitespace-nowrap font-display ${textColor} ${
              feature ? "type-display-lg uppercase" : "type-h2 italic"
            }`}
          >
            {feature
              ? words.map((word, w) => (
                  <span key={w} className={w % 2 === 1 ? "text-outline" : undefined}>
                    {word}
                    {w < words.length - 1 ? " " : ""}
                  </span>
                ))
              : text}
          </span>
          <span className={`mx-8 sm:mx-12 ${dividerColor}`} aria-hidden="true">
            /
          </span>
        </span>
      ))}
    </span>
  );
}
