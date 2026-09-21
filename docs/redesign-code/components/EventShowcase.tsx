"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useInView, usePrefersReducedMotion, withViewTransition } from "@/lib/motion";
import { useLightbox, type Photo } from "./Lightbox";

export type EventBlock = {
  /** e.g. "galentines" - used for view-transition names, must be unique on the page */
  slug: string;
  /** "01", "02", "03" */
  index: string;
  /** Existing event heading, unchanged */
  title: string;
  /** Existing photos, in the current order. photos[featured] starts in the big slot. */
  photos: Photo[];
  featured?: number;
};

const ADVANCE_MS = 6000;

/**
 * Pin 1 "Timed Card Opening":
 * big featured photo + a rail of portrait cards. Clicking a card (or the timer)
 * morphs that card into the featured slot with a View Transition.
 */
export function EventShowcase({ event }: { event: EventBlock }) {
  const [active, setActive] = useState(event.featured ?? 0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const onScreen = useInView(root, { once: false, threshold: 0.35, rootMargin: "0px" });
  const reduced = usePrefersReducedMotion();
  const openLightbox = useLightbox();
  const count = event.photos.length;
  const running = onScreen && !paused && !reduced && count > 1;

  const featRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const vtFeatured = `vt-${event.slug}-feature`;

  // True morph: for the "before" snapshot, the chosen card borrows the featured
  // photo's transition name, so the browser animates card -> featured slot.
  const go = useCallback(
    (i: number) => {
      const next = ((i % count) + count) % count;
      const card = railRef.current?.querySelector<HTMLElement>(`[data-idx="${next}"]`);
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

  // Timed advance. Restarts whenever the active photo changes, so manual clicks reset the clock.
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(active + 1), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [running, active, go]);

  const featured = event.photos[active];

  return (
    <div
      ref={root}
      className="event-showcase relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Featured photo */}
      <button
        ref={featRef}
        type="button"
        onClick={() => openLightbox(featured)}
        className="photo-card group relative block aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)]"
        style={{ viewTransitionName: vtFeatured }}
        aria-label={`Open larger: ${featured.alt}`}
      >
        <Image
          src={featured.src}
          alt={featured.alt}
          fill
          sizes="(min-width: 88rem) 81rem, 92vw"
          quality={85}
          placeholder="blur"
          className="object-cover"
        />
        {/* Title plate, Pin 2 frosted glass */}
        <span className="glass-dark absolute bottom-4 left-4 rounded-[var(--radius-card)] px-5 py-3 md:bottom-8 md:left-8">
          <span className="font-display type-display text-[var(--color-ink-invert)]">{event.title}</span>
        </span>
        {/* Oversized outlined index, Pin 1 "01" */}
        <span
          aria-hidden
          className="text-outline font-display type-display-xl absolute bottom-2 right-6 leading-none"
        >
          {event.index}
        </span>
      </button>

      {/* Card rail: keeps your existing snap-scroll behaviour */}
      <ol
        ref={railRef}
        className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 md:gap-4"
        aria-label={`${event.title} photos`}
      >
        {event.photos.map((p, i) => {
          const isActive = i === active;
          return (
            <li key={i} className="snap-start">
              <button
                type="button"
                data-idx={i}
                onClick={() => go(i)}
                aria-pressed={isActive}
                aria-label={`Show photo ${i + 1} of ${count}: ${p.alt}`}
                className={`photo-card relative block aspect-[3/4] w-36 overflow-hidden rounded-[var(--radius-card)] transition-[opacity,outline-color] duration-base md:w-44 ${
                  isActive ? "outline-2 outline-offset-2 outline-[var(--accent)]" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image src={p.src} alt="" fill sizes="(min-width: 48rem) 11rem, 9rem" className="object-cover" />
                {/* Timer progress bar on the active card */}
                {isActive && running && (
                  <span
                    key={active}
                    aria-hidden
                    className="card-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--color-coral)]"
                    style={{ animationDuration: `${ADVANCE_MS}ms` }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
