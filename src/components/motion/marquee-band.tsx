interface MarqueeBandProps {
  /** The single phrase repeated across the band. */
  text: string;
  className?: string;
}

const REPEATS = 8;

/**
 * A full-bleed band of one phrase repeated and scrolling slowly, used to
 * divide sections. Two identical tracks sit side by side and the pair
 * translates by exactly 50%, so the loop has no visible seam. Holds still
 * under prefers-reduced-motion (see the marquee-track utility) rather than
 * animating: the phrase still reads, it just doesn't move.
 */
export function MarqueeBand({ text, className = "" }: MarqueeBandProps) {
  return (
    <div
      role="separator"
      aria-label={text}
      className={`overflow-hidden border-y border-rule bg-label py-4 ${className}`}
    >
      <div className="marquee-track flex w-max" aria-hidden="true">
        <Track text={text} />
        <Track text={text} />
      </div>
    </div>
  );
}

function Track({ text }: { text: string }) {
  return (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: REPEATS }).map((_, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap font-display type-h2 italic text-on-label">
            {text}
          </span>
          <span className="mx-8 text-on-label/50 sm:mx-12" aria-hidden="true">
            /
          </span>
        </span>
      ))}
    </span>
  );
}
