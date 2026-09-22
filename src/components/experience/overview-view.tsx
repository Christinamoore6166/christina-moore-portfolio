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
 * one contact action. Two glass-dark tiles on desktop, stacked on
 * mobile; the same two pieces of content, just no longer forced into a
 * single column.
 */
export function OverviewView() {
  const ref = useDrawIn<HTMLDivElement>();
  const words = RESUME.summary.split(/\s+/).filter(Boolean);
  const step =
    words.length > 1
      ? Math.min(WORD_STAGGER, STAGGER_CAP / (words.length - 1))
      : 0;

  return (
    <div ref={ref} className="group/draw grid gap-block md:grid-cols-2">
      <div className="glass-dark rounded-card px-gutter py-block">
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
      </div>
      <div className="glass-dark rounded-card flex items-center px-gutter py-block">
        <LinkedInButton />
      </div>
    </div>
  );
}
