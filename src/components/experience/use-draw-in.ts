"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/* Layout effect on the client so the "out" state lands before first
   paint; a plain effect on the server, where layout effects do not run. */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Draw-in for a group of elements, on the same contract as <Reveal>: the
 * container has no data-drawn attribute until JavaScript sets it, so
 * no-JS, reduced motion and the server render all show the final state.
 * With motion allowed the container is marked "out" before paint and
 * "in" once it enters the viewport; children animate with
 * group-data-[drawn=out]/draw utilities and their own transition delays.
 */
export function useDrawIn<T extends HTMLElement>(
  margin = "0px 0px -10% 0px",
) {
  const ref = useRef<T | null>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || typeof IntersectionObserver === "undefined") {
      return;
    }

    el.dataset.drawn = "out";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.dataset.drawn = "in";
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return ref;
}
