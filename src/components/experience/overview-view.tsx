"use client";

import { Fragment } from "react";
import { RESUME } from "@/data/resume";
import { LinkedInButton } from "@/components/linkedin-button";
import { useDrawIn } from "./use-draw-in";

/* Per-word stagger, and the cap on the span of delays across the text. */
const WORD_STAGGER = 20;
const STAGGER_CAP = 1200;

/**
 * The summary in the display serif, one word at a time, then the site's
 * one contact action.
 */
export function OverviewView() {
  const ref = useDrawIn<HTMLDivElement>();
  const words = RESUME.summary.split(/\s+/).filter(Boolean);
  const step =
    words.length > 1
      ? Math.min(WORD_STAGGER, STAGGER_CAP / (words.length - 1))
      : 0;

  return (
    <div ref={ref} className="group/draw flex flex-col items-start gap-block">
      <p className="font-display type-h2 text-ink">
        {/* [display:inline-block] rather than the inline-block class: with
            the spacing token named "block", Tailwind also reads that class
            as inline-size: var(--spacing-block) and fixes every word box. */}
        {words.map((word, i) => (
          <Fragment key={i}>
            <span
              className="[display:inline-block] transition-[opacity,translate] duration-reveal ease-out motion-reduce:transition-none group-data-[drawn=out]/draw:translate-y-2 group-data-[drawn=out]/draw:opacity-0"
              style={{ transitionDelay: `${Math.round(i * step)}ms` }}
            >
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>
      <LinkedInButton />
    </div>
  );
}
