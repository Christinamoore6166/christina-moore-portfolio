"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ImageAsset } from "@/content/images";
import { blurProps, imageSrc } from "@/lib/images";

/**
 * One native <dialog> for the whole page. Wrap the page in
 * <LightboxProvider>, then call useLightbox()(photos, index) from any
 * photo button.
 *
 * showModal() gives escape, the focus trap and focus restore to the
 * trigger for free, which is most of what the two hand-rolled dialogs
 * this replaces were doing by hand. Two things it does not give, and
 * that the old EventFeature dialog did, are kept here rather than
 * dropped: scroll lock with scrollbar-width compensation, and arrow-key
 * navigation. That is why open() takes the whole list and an index
 * instead of the reference's single photo.
 *
 * Alt text is whatever the manifest already carries for the photo; none
 * is written here.
 */
type OpenLightbox = (photos: ImageAsset[], index: number) => void;

const LightboxContext = createContext<OpenLightbox>(() => {});
export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [photos, setPhotos] = useState<ImageAsset[]>([]);
  const [index, setIndex] = useState(0);

  const count = photos.length;

  const lock = useCallback(() => {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.dataset.lbOverflow = document.body.style.overflow;
    document.body.dataset.lbPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  }, []);

  const unlock = useCallback(() => {
    document.body.style.overflow = document.body.dataset.lbOverflow ?? "";
    document.body.style.paddingRight = document.body.dataset.lbPadding ?? "";
    delete document.body.dataset.lbOverflow;
    delete document.body.dataset.lbPadding;
  }, []);

  const open = useCallback<OpenLightbox>(
    (list, i) => {
      if (list.length === 0) return;
      setPhotos(list);
      setIndex(((i % list.length) + list.length) % list.length);
      dialogRef.current?.showModal();
      lock();
    },
    [lock],
  );

  const step = useCallback(
    (delta: number) => {
      setIndex((i) => (count === 0 ? i : (i + delta + count) % count));
    },
    [count],
  );

  /* Scroll lock and arrow keys. A native modal dialog makes the rest of
     the page inert but does not stop it scrolling behind the backdrop. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || count === 0) return;

    const onKey = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, step]);

  const current = photos[index];

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        onClose={() => {
          unlock();
          setPhotos([]);
        }}
        className="lightbox m-auto max-h-[92vh] max-w-[92vw] bg-transparent p-0"
        aria-label={current?.alt ?? "Photo"}
      >
        {current ? (
          <figure className="relative flex flex-col items-center">
            <Image
              key={imageSrc(current)}
              src={imageSrc(current)}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="92vw"
              {...blurProps(current)}
              className="max-h-[78vh] w-auto rounded-card object-contain"
            />

            <figcaption className="glass-dark mt-3 max-w-prose rounded-pill px-4 py-2 text-center type-small text-on-inverse">
              {current.alt}
            </figcaption>

            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="glass absolute top-3 right-3 grid size-11 place-items-center rounded-pill text-ink"
              aria-label="Close photo"
            >
              <X aria-hidden="true" className="size-5" />
            </button>

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="glass absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-pill text-ink"
                  aria-label="Previous photo"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="glass absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-pill text-ink"
                  aria-label="Next photo"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </>
            ) : null}
          </figure>
        ) : null}
      </dialog>
    </LightboxContext.Provider>
  );
}
