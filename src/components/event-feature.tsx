"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/content/images";
import { imageSrc } from "@/lib/images";

/** The strip is numbered 01 to 05; anything longer is a mistake upstream. */
export const STRIP_MAX = 5;

export type EventFeatureVariant = "default" | "collage";

interface EventFeatureProps {
  /** Event name, set as the label that overhangs the feature image. */
  title: string;
  featureImage: ImageAsset;
  /** Up to five supporting images. Default: a numbered strip. Collage: overlapped and rotated. */
  strip: ImageAsset[];
  variant?: EventFeatureVariant;
  /** True only for the page's first EventFeature: its feature image loads eager/high priority instead of lazy. */
  priority?: boolean;
}

/* Widths the images actually render at, so the browser picks the right
   srcset candidate. The frame is 88rem wide at most with a gutter each
   side, so the feature image tops out at 81rem; below that the gutter is
   4vw a side. */
const FEATURE_SIZES = "(min-width: 88rem) 81rem, 92vw";
const STRIP_SIZES = "(min-width: 88rem) 16rem, (min-width: 48rem) 18vw, 68vw";
const COLLAGE_SIZES = "(min-width: 88rem) 33rem, (min-width: 48rem) 37vw, 46vw";

/* Collage positions as percentages of the frame, so the overlap holds at
   any width. Two sets: the frame is 5:4 below md and 16:10 from md up, so
   the photos are wider on the phone and the desktop frame stays short.
   Every box, rotation included, stays inside the frame. */
const COLLAGE = [
  { m: ["2%", "4%", "46%"], d: ["1%", "6%", "36%"], rotate: "-4deg", z: 10 },
  { m: ["30%", "2%", "44%"], d: ["31%", "2%", "34%"], rotate: "3deg", z: 20 },
  { m: ["56%", "6%", "43%"], d: ["62%", "8%", "36%"], rotate: "-2deg", z: 10 },
  { m: ["8%", "52%", "44%"], d: ["10%", "50%", "34%"], rotate: "2deg", z: 20 },
  { m: ["46%", "48%", "48%"], d: ["54%", "46%", "40%"], rotate: "-3deg", z: 30 },
] as const;

const number = (i: number) => String(i + 1).padStart(2, "0");

/**
 * The one gallery module: a feature image with the event name overhanging
 * its top-left corner, then the supporting images beneath, either as a
 * numbered strip (five across on desktop, scroll-snapped on the phone with
 * the next tile peeking) or as the rotated collage.
 *
 * Every image is a button that opens the full-size view. The dialog here
 * mirrors the lightbox component's behaviour exactly (escape, arrow keys,
 * focus trap, scroll lock, focus restore) and is portalled to <body> so
 * an ancestor's reveal transform can never become its containing block.
 * Section entry is left to the <Reveal> that wraps each module.
 */
export function EventFeature({
  title,
  featureImage,
  strip,
  variant = "default",
  priority = false,
}: EventFeatureProps) {
  if (strip.length > STRIP_MAX) {
    throw new Error(
      `EventFeature "${title}" has ${strip.length} strip images; the limit is ${STRIP_MAX}`,
    );
  }

  const all = [featureImage, ...strip];
  const count = all.length;

  const [index, setIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const open = (trigger: HTMLElement, i: number) => {
    triggerRef.current = trigger;
    setIndex(i);
  };
  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);
  const next = () => setIndex((i) => (i === null ? i : (i + 1) % count));
  const prev = () =>
    setIndex((i) => (i === null ? i : (i - 1 + count) % count));

  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowRight") {
        setIndex((i) => (i === null ? i : (i + 1) % count));
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => (i === null ? i : (i - 1 + count) % count));
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>("button");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, count, close]);

  const current = index !== null ? all[index] : null;

  return (
    <div>
      {/* Feature. The label hangs over the top-left corner by about half
          its cap height, on the rose label ground so it reads over any
          photograph. It sits outside the zoom wrapper so it is not clipped. */}
      <div className="relative">
        <h3 className="absolute top-0 left-0 z-10 max-w-full -translate-y-[0.34em] bg-label px-4 py-2 font-display type-h2 italic text-on-label">
          {title}
        </h3>
        <button
          type="button"
          onClick={(e) => open(e.currentTarget, 0)}
          aria-label={`Open full size: ${featureImage.alt}`}
          className="hover-zoom block aspect-[4/3] max-h-[70vh] w-full bg-placeholder md:aspect-[21/9]"
        >
          <Image
            src={imageSrc(featureImage)}
            alt={featureImage.alt}
            width={featureImage.width}
            height={featureImage.height}
            sizes={FEATURE_SIZES}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? undefined : "async"}
            fetchPriority={priority ? "high" : undefined}
            className="size-full object-cover"
          />
        </button>
      </div>

      {variant === "collage" ? (
        <ol className="relative mt-3 aspect-[5/4] overflow-hidden md:mt-4 md:aspect-[16/10]">
          {strip.map((img, i) => {
            const pos = COLLAGE[i];
            const style = {
              "--l": pos.m[0],
              "--t": pos.m[1],
              "--w": pos.m[2],
              "--dl": pos.d[0],
              "--dt": pos.d[1],
              "--dw": pos.d[2],
              rotate: pos.rotate,
              zIndex: pos.z,
            } as CSSProperties;
            return (
              <li
                key={img.webp}
                style={style}
                className="absolute top-(--t) left-(--l) w-(--w) md:top-(--dt) md:left-(--dl) md:w-(--dw)"
              >
                <button
                  type="button"
                  onClick={(e) => open(e.currentTarget, i + 1)}
                  aria-label={`Open full size: ${img.alt}`}
                  className="hover-zoom block aspect-[4/3] w-full bg-placeholder"
                >
                  <Image
                    src={imageSrc(img)}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes={COLLAGE_SIZES}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        /* Below md the list runs through the gutters as a snap scroller,
           each tile 72% wide so the next one shows; the vertical padding
           keeps focus rings inside the scroll box. From md it is a plain
           five-column grid with equal gutters. */
        <ol className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain max-md:bleed max-md:-my-1.5 max-md:px-gutter max-md:py-1.5 max-md:scroll-px-gutter md:mt-4 md:grid md:grid-cols-5 md:gap-4 md:snap-none md:overflow-visible">
          {strip.map((img, i) => (
            <li
              key={img.webp}
              className="flex w-[72%] shrink-0 snap-start flex-col gap-2 md:w-auto"
            >
              <button
                type="button"
                onClick={(e) => open(e.currentTarget, i + 1)}
                aria-label={`Open full size: ${img.alt}`}
                className="hover-zoom block aspect-[4/5] w-full bg-placeholder"
              >
                <Image
                  src={imageSrc(img)}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes={STRIP_SIZES}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              </button>
              <span className="eyebrow px-1 tabular-nums text-ink-soft">
                {number(i)}
              </span>
            </li>
          ))}
        </ol>
      )}

      {current
        ? createPortal(
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={current.alt}
              className="fixed inset-0 z-50 flex items-center justify-center bg-inverse/95 p-gutter"
              onClick={close}
            >
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute top-4 right-4 text-on-inverse transition-ink hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-inverse"
              >
                <X aria-hidden="true" className="size-8" />
              </button>
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prev();
                    }}
                    aria-label="Previous image"
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-on-inverse transition-ink hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-inverse"
                  >
                    <ChevronLeft aria-hidden="true" className="size-8" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      next();
                    }}
                    aria-label="Next image"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-on-inverse transition-ink hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-inverse"
                  >
                    <ChevronRight aria-hidden="true" className="size-8" />
                  </button>
                </>
              ) : null}
              <div
                className="max-h-[85vh] max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={imageSrc(current)}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="90vw"
                  className="max-h-[85vh] w-auto object-contain"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
