"use client";

import { type CSSProperties } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/content/images";
import { blurProps, imageSrc } from "@/lib/images";
import { useLightbox } from "@/components/lightbox-provider";

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
  /**
   * Swaps hover-zoom for photo-card (radius-card, the stronger zoom
   * plus saturate) to match Branding's timed showcase. Off by default:
   * the grammar itself is unchanged, this is styling only.
   */
  photoCard?: boolean;
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
 * Every image is a button that opens the full-size view. The dialog this
 * module used to own was replaced by the page-level LightboxProvider,
 * one native <dialog> for the whole page: escape, the focus trap and
 * focus restore now come from showModal(), and the scroll lock and
 * arrow-key navigation moved across with it rather than being dropped.
 * Section entry is left to the <Reveal> that wraps each module.
 */
export function EventFeature({
  title,
  featureImage,
  strip,
  variant = "default",
  priority = false,
  photoCard = false,
}: EventFeatureProps) {
  if (strip.length > STRIP_MAX) {
    throw new Error(
      `EventFeature "${title}" has ${strip.length} strip images; the limit is ${STRIP_MAX}`,
    );
  }

  const all = [featureImage, ...strip];
  const openLightbox = useLightbox();
  const open = (i: number) => openLightbox(all, i);
  const frame = photoCard ? "photo-card" : "hover-zoom";

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
          onClick={() => open(0)}
          aria-label={`Open full size: ${featureImage.alt}`}
          className={`${frame} block aspect-[4/3] max-h-[70vh] w-full bg-placeholder md:aspect-[21/9]`}
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
            {...blurProps(featureImage)}
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
                  onClick={() => open(i + 1)}
                  aria-label={`Open full size: ${img.alt}`}
                  className={`${frame} block aspect-[4/3] w-full bg-placeholder`}
                >
                  <Image
                    src={imageSrc(img)}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes={COLLAGE_SIZES}
                    {...blurProps(img)}
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
                onClick={() => open(i + 1)}
                aria-label={`Open full size: ${img.alt}`}
                className={`${frame} block aspect-[4/5] w-full bg-placeholder`}
              >
                <Image
                  src={imageSrc(img)}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes={STRIP_SIZES}
                  {...blurProps(img)}
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

    </div>
  );
}
