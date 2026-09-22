import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { StockImage } from "@/content/images";
import { blurProps, stockSrc } from "@/lib/images";

type Tint = "ground" | "espresso";

interface BackdropBandProps {
  image: StockImage;
  tint: Tint;
  /** Overlay opacity, 0 to 1. */
  opacity: number;
  /** CSS height, e.g. "40vh". Omit to size to the children instead. */
  height?: string;
  /**
   * Scroll-linked drift. The photo is laid out 12% taller than the band
   * and offset by half of that, so the travel never exposes an edge.
   * Does nothing where animation-timeline is unsupported, and is switched
   * off under reduced motion.
   */
  drift?: boolean;
  children: ReactNode;
  className?: string;
}

const TINT_COLOR: Record<Tint, string> = {
  ground: "var(--color-ground)",
  espresso: "var(--color-espresso)",
};

/* 100vw at every breakpoint: the band is always full-bleed, so next/image
   picks a viewport-sized candidate instead of ever fetching the source
   file's full 3000px+ width on the phone. */
const SIZES = "100vw";

/**
 * A full-bleed stock photo with a token-colour tint and content centred
 * over it. Static at every breakpoint and viewport: the CSS
 * background-attachment: fixed the brief allowed for this does not apply
 * to next/image's <img> output (that property only paints CSS
 * background-image), and faking the same look with position: fixed would
 * spend the site's one-parallax motion budget three times over, so this
 * renders as a plain full-bleed photo with no scroll-linked movement.
 */
export function BackdropBand({
  image,
  tint,
  opacity,
  height,
  drift = false,
  children,
  className,
}: BackdropBandProps) {
  const src = stockSrc(image);
  const style = height ? ({ height } as CSSProperties) : undefined;

  return (
    <div
      className={
        "relative isolate flex w-full items-center justify-center overflow-hidden" +
        /* The band clips, so it has to own the view timeline: a view()
           on the photo itself would measure against this box rather
           than the page and never move. */
        (drift ? " drift-frame" : "") +
        (className ? ` ${className}` : "")
      }
      style={style}
    >
      {/* Only the drifting variant is oversized. A static band keeps
          inset-0 so its crop is unchanged. */}
      <div
        className={
          drift
            ? "drift absolute inset-x-0 -top-[6%] -z-20 h-[112%]"
            : "absolute inset-0 -z-20"
        }
      >
        <Image
          src={src}
          alt={image.alt}
          fill
          sizes={SIZES}
          loading="lazy"
          decoding="async"
          {...blurProps(image)}
          className="object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: TINT_COLOR[tint], opacity }}
      />
      <div className="relative flex size-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
