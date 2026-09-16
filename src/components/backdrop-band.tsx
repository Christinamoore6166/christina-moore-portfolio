import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { StockImage } from "@/content/images";

type Tint = "ground" | "espresso";

interface BackdropBandProps {
  image: StockImage;
  tint: Tint;
  /** Overlay opacity, 0 to 1. */
  opacity: number;
  /** CSS height, e.g. "40vh". Omit to size to the children instead. */
  height?: string;
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
  children,
  className,
}: BackdropBandProps) {
  const src = "/" + image.jpg.replace(/^public\//, "");
  const style = height ? ({ height } as CSSProperties) : undefined;

  return (
    <div
      className={
        "relative isolate flex w-full items-center justify-center overflow-hidden" +
        (className ? ` ${className}` : "")
      }
      style={style}
    >
      <Image
        src={src}
        alt={image.alt}
        fill
        sizes={SIZES}
        loading="lazy"
        decoding="async"
        className="-z-20 object-cover"
      />
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
