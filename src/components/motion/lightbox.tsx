"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/content/images";
import { imageSrc } from "@/lib/images";

interface LightboxProps {
  images: ImageAsset[];
  className?: string;
}

/**
 * Grid of tiles that opens a full-size view. Evaluated two 21st.dev
 * lightboxes first (see CLAUDE.md's registry rule for behavior-heavy
 * components): one had no escape handling, scroll lock, or focus
 * management at all; the other got escape and scroll lock right but
 * still skipped focus trapping, arrow-key navigation, and restoring
 * focus on close. Hand-built here so all of it is covered.
 */
export function Lightbox({ images, className = "" }: LightboxProps) {
  const [index, setIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    setIndex(null);
    triggerRef.current?.focus();
  };
  const next = () => setIndex((i) => (i === null ? i : (i + 1) % images.length));
  const prev = () =>
    setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));

  useEffect(() => {
    if (index === null) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
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
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const current = index !== null ? images[index] : null;

  // The grid runs 2/3/4 columns across breakpoints (lcm 12). Pad the last
  // row with invisible filler cells so it never leaves a partial row —
  // an incomplete row shows the grid's gap color as a solid block instead
  // of a hairline, since there's no tile there to cover it.
  const fillerCount = (12 - (images.length % 12)) % 12;

  return (
    <>
      <ul
        className={`grid grid-cols-2 gap-px bg-rule sm:grid-cols-3 md:grid-cols-4 ${className}`}
      >
        {images.map((img, i) => (
          <li key={img.webp} className="bg-page">
            <button
              type="button"
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setIndex(i);
              }}
              className="hover-zoom block aspect-square w-full bg-placeholder"
              aria-label={`Open full size: ${img.alt}`}
            >
              <Image
                src={imageSrc(img)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                loading="lazy"
                className="size-full object-contain p-2"
              />
            </button>
          </li>
        ))}
        {Array.from({ length: fillerCount }, (_, i) => (
          <li key={`filler-${i}`} aria-hidden="true" className="bg-page" />
        ))}
      </ul>

      {current ? (
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
            className="absolute right-4 top-4 text-on-inverse transition-ink hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-inverse"
          >
            <X aria-hidden="true" className="size-8" />
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-inverse transition-ink hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-inverse"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-inverse transition-ink hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-inverse"
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
        </div>
      ) : null}
    </>
  );
}
