"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ImageAsset } from "@/content/images";
import { blurProps, imageSrc } from "@/lib/images";
import {
  useHasViewTransitions,
  useInView,
  usePrefersReducedMotion,
  withViewTransition,
} from "@/lib/motion";
import { useLightbox } from "@/components/lightbox-provider";

export type EventBlock = {
  /** Used for view-transition names, so it must be unique on the page. */
  slug: string;
  /** "01", "02", "03" */
  index: string;
  /** The event heading, from SITE.sections.branding.subItems. */
  title: string;
  /** Every photo the event shows, photos[featured] in the big slot. */
  photos: ImageAsset[];
  featured?: number;
};

const ADVANCE_MS = 6000;

/* The frame is 88rem at most with a gutter each side, so the feature
   image tops out at 81rem; below that the gutter is 4vw a side. */
const FEATURE_SIZES = "(min-width: 88rem) 81rem, 92vw";
const CARD_SIZES = "(min-width: 48rem) 11rem, 9rem";

/**
 * Pin 1, the timed card opening: a wide featured photo over a rail of
 * portrait cards. Clicking a card, or the six-second timer, morphs that
 * card into the featured slot with a View Transition.
 *
 * The timer runs only while the block is on screen, unhovered and
 * unfocused, and never under reduced motion. Where View Transitions are
 * unsupported the swap falls back to a cross-fade keyed off the active
 * index; that fade is suppressed when the browser has View Transitions
 * so the two never double up.
 */
export function EventShowcase({ event }: { event: EventBlock }) {
  const [active, setActive] = useState(event.featured ?? 0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const onScreen = useInView(root, {
    once: false,
    threshold: 0.35,
    rootMargin: "0px",
  });
  const reduced = usePrefersReducedMotion();
  const openLightbox = useLightbox();
  const count = event.photos.length;
  const running = onScreen && !paused && !reduced && count > 1;

  const featRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const vtFeatured = `vt-${event.slug}-feature`;

  const hasViewTransitions = useHasViewTransitions();

  /* True morph: for the "before" snapshot the chosen card borrows the
     featured photo's transition name, so the browser animates the card
     into the featured slot rather than cross-fading two unrelated
     boxes. */
  const go = useCallback(
    (i: number) => {
      const next = ((i % count) + count) % count;
      const card = railRef.current?.querySelector<HTMLElement>(
        `[data-idx="${next}"]`,
      );
      const feat = featRef.current;
      if (card && feat) {
        feat.style.viewTransitionName = "none";
        card.style.viewTransitionName = vtFeatured;
      }
      withViewTransition(() => {
        flushSync(() => setActive(next));
        if (card) card.style.viewTransitionName = "";
        if (feat) feat.style.viewTransitionName = vtFeatured;
      });
    },
    [count, vtFeatured],
  );

  /* Restarts whenever the active photo changes, so a manual click
     resets the clock rather than firing straight after. */
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(active + 1), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [running, active, go]);

  const featured = event.photos[active];
  const fade = !hasViewTransitions && !reduced;

  return (
    <div
      ref={root}
      className="event-showcase relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <button
        ref={featRef}
        type="button"
        onClick={() => openLightbox(event.photos, active)}
        className="photo-card group relative block aspect-[16/9] w-full"
        style={{ viewTransitionName: vtFeatured }}
        aria-label={`Open larger: ${featured.alt}`}
      >
        <Image
          key={fade ? active : undefined}
          src={imageSrc(featured)}
          alt={featured.alt}
          fill
          sizes={FEATURE_SIZES}
          quality={85}
          {...blurProps(featured)}
          className={
            fade ? "showcase-fade object-cover" : "object-cover"
          }
        />

        {/* The plate and the numeral share the bottom edge, so both step
            down a size below md. At 390 the display pair overlapped:
            "White Elephant" plus its padding ran to 270px and the
            numeral needed another 90px inside a 390px frame. */}
        <span className="glass-dark absolute bottom-4 left-4 rounded-card px-4 py-2 md:bottom-8 md:left-8 md:px-5 md:py-3">
          <span className="font-display type-h2 text-on-inverse md:type-display">
            {event.title}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="text-outline absolute right-6 bottom-2 font-display type-display-lg leading-none md:type-display-xl"
        >
          {event.index}
        </span>
      </button>

      <ol
        ref={railRef}
        className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 md:gap-4"
        aria-label={`${event.title} photos`}
      >
        {event.photos.map((p, i) => {
          const isActive = i === active;
          return (
            <li key={imageSrc(p)} className="snap-start">
              <button
                type="button"
                data-idx={i}
                onClick={() => go(i)}
                aria-pressed={isActive}
                aria-label={`Show photo ${i + 1} of ${count}: ${p.alt}`}
                className={`photo-card relative block aspect-[3/4] w-36 duration-base transition-[opacity,outline-color] md:w-44 ${
                  isActive
                    ? "outline-2 outline-offset-2 outline-accent"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={imageSrc(p)}
                  alt=""
                  fill
                  sizes={CARD_SIZES}
                  {...blurProps(p)}
                  className="object-cover"
                />
                {isActive && running ? (
                  <span
                    key={active}
                    aria-hidden="true"
                    className="card-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-coral"
                    style={{ animationDuration: `${ADVANCE_MS}ms` }}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
