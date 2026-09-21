"use client";

import Image, { type StaticImageData } from "next/image";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type Photo = { src: StaticImageData; alt: string };

const LightboxContext = createContext<(photo: Photo) => void>(() => {});
export const useLightbox = () => useContext(LightboxContext);

/**
 * One native <dialog> for the whole page.
 * Wrap <main> in <LightboxProvider>, then call useLightbox()(photo) from any photo button.
 * Esc closes it for free (native dialog). Clicking the frosted backdrop also closes it.
 */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);

  const open = useCallback((p: Photo) => {
    setPhoto(p);
    dialog.current?.showModal();
  }, []);

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        onClose={() => setPhoto(null)}
        className="lightbox m-auto max-h-[92vh] max-w-[92vw] bg-transparent p-0"
        aria-label={photo?.alt ?? "Photo"}
      >
        {photo && (
          <figure className="relative">
            <Image
              src={photo.src}
              alt={photo.alt}
              sizes="92vw"
              quality={85}
              placeholder="blur"
              className="max-h-[86vh] w-auto rounded-[var(--radius-card)] object-contain"
            />
            <figcaption className="glass-dark mt-3 rounded-full px-4 py-2 type-small text-[var(--color-ink-invert)]">
              {photo.alt}
            </figcaption>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="glass absolute right-3 top-3 grid size-10 place-items-center rounded-full"
              aria-label="Close photo"
            >
              ✕
            </button>
          </figure>
        )}
      </dialog>
    </LightboxContext.Provider>
  );
}
