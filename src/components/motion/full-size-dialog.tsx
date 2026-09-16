"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/content/images";
import { imageSrc } from "@/lib/images";

interface FullSizeDialogProps {
  images: ImageAsset[];
  /** Index of the image on show. */
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}

/**
 * The full-size view, shared by galleries. Same behaviour as the lightbox
 * component's dialog: escape closes, arrow keys step, tab is trapped on
 * the three buttons, page scroll is locked without a layout shift, and
 * it is portalled to <body> so an ancestor transform (the scroll reveal's
 * translate) can never become its containing block. Restoring focus to
 * the trigger belongs to the caller; useFullSize below does that.
 */
export function FullSizeDialog({
  images,
  index,
  onIndex,
  onClose,
}: FullSizeDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const count = images.length;
  const current = images[index];

  // Scroll lock and initial focus: once per open. The dialog only mounts
  // while open, so mount and unmount are the open and close moments.
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight") onIndex((index + 1) % count);
      if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
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
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onIndex, onClose]);

  if (!current) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse/95 p-gutter"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
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
              onIndex((index - 1 + count) % count);
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
              onIndex((index + 1) % count);
            }}
            aria-label="Next image"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-on-inverse transition-ink hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-inverse"
          >
            <ChevronRight aria-hidden="true" className="size-8" />
          </button>
        </>
      ) : null}
      <div className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
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
  );
}

/**
 * Owns the open state for a set of tiles. `open` takes the trigger so
 * focus returns to it on close; `dialog` is the element to render, null
 * while closed.
 */
export function useFullSize(images: ImageAsset[]) {
  const [index, setIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((trigger: HTMLElement, i: number) => {
    triggerRef.current = trigger;
    setIndex(i);
  }, []);
  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);

  const dialog: ReactNode =
    index === null ? null : (
      <FullSizeDialog
        images={images}
        index={index}
        onIndex={setIndex}
        onClose={close}
      />
    );

  return { open, dialog };
}
