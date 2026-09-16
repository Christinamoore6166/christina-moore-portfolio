"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { ImageAsset } from "@/content/images";
import { imageSrc } from "@/lib/images";
import { useFullSize } from "@/components/motion/full-size-dialog";

interface TileMarqueeProps {
  images: ImageAsset[];
}

/* One tile's worth of travel per 3.5s, so both rows move at the same
   speed whatever their tile count: about 56px/s on desktop, 38 on the phone. */
const SECONDS_PER_TILE = 3.5;
const TILE_SIZES = "(min-width: 48rem) 180px, 120px";
const GRID_SIZES = "(min-width: 88rem) 13rem, (min-width: 48rem) 15vw, 30vw";

/**
 * Two rows of square tiles, the top row drifting left and the bottom
 * right, on the marquee band's own keyframe (marquee-scroll in
 * globals.css, 0 to -50%); the bottom row simply runs it in reverse.
 * Each row is one track rendered twice, the copy aria-hidden and out of
 * the tab order, and the translate is exactly one track's width so the
 * loop has no seam. Hovering or focusing anything in the marquee pauses
 * both rows. Under prefers-reduced-motion the rows are not rendered at
 * all and the same tiles sit in a static grid instead. Every tile opens
 * the shared full-size view.
 */
export function TileMarquee({ images }: TileMarqueeProps) {
  const { open, dialog } = useFullSize(images);

  if (images.length === 0) return null;

  const half = Math.ceil(images.length / 2);
  const rows = [
    { tiles: images.slice(0, half), offset: 0 },
    { tiles: images.slice(half), offset: half },
  ].filter((row) => row.tiles.length > 0);

  return (
    <div>
      <div className="group bleed flex flex-col gap-3 motion-reduce:hidden md:gap-4">
        {rows.map((row, r) => (
          <div key={row.offset} className="overflow-hidden">
            <div
              style={
                {
                  "--marquee-duration": `${row.tiles.length * SECONDS_PER_TILE}s`,
                } as CSSProperties
              }
              className={`flex w-max animate-[marquee-scroll_var(--marquee-duration)_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] ${
                r % 2 === 1 ? "[animation-direction:reverse]" : ""
              }`}
            >
              <Track tiles={row.tiles} offset={row.offset} open={open} />
              <Track tiles={row.tiles} offset={row.offset} open={open} copy />
            </div>
          </div>
        ))}
      </div>

      <ul className="hidden grid-cols-3 gap-3 motion-reduce:grid md:grid-cols-6 md:gap-4">
        {images.map((img, i) => (
          <li key={img.webp}>
            <button
              type="button"
              onClick={(e) => open(e.currentTarget, i)}
              aria-label={`Open full size: ${img.alt}`}
              className="hover-zoom block aspect-square w-full bg-placeholder"
            >
              <Image
                src={imageSrc(img)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes={GRID_SIZES}
                loading="lazy"
                decoding="async"
                className="size-full object-contain p-2"
              />
            </button>
          </li>
        ))}
      </ul>

      {dialog}
    </div>
  );
}

/* The gap and the trailing padding live inside the track so the two
   copies are the same width and -50% lands exactly on the seam. */
function Track({
  tiles,
  offset,
  open,
  copy = false,
}: {
  tiles: ImageAsset[];
  offset: number;
  open: (trigger: HTMLElement, index: number) => void;
  copy?: boolean;
}) {
  return (
    <ul
      aria-hidden={copy || undefined}
      className="flex shrink-0 gap-3 pr-3 md:gap-4 md:pr-4"
    >
      {tiles.map((img, i) => (
        <li key={img.webp} className="size-30 shrink-0 md:size-45">
          <button
            type="button"
            tabIndex={copy ? -1 : undefined}
            onClick={(e) => open(e.currentTarget, offset + i)}
            aria-label={`Open full size: ${img.alt}`}
            className="hover-zoom block size-full bg-placeholder"
          >
            <Image
              src={imageSrc(img)}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes={TILE_SIZES}
              loading="lazy"
              decoding="async"
              className="size-full object-contain p-2"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
