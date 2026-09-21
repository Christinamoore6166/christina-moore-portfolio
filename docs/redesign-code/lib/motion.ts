"use client";

import { useEffect, useState, type RefObject } from "react";

/** True when the visitor has asked the OS for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* One shared IntersectionObserver per option set, so 100+ elements cost one observer. */
type Callback = (entry: IntersectionObserverEntry) => void;
const observers = new Map<string, { io: IntersectionObserver; cbs: Map<Element, Callback> }>();

function getObserver(options: IntersectionObserverInit) {
  const key = JSON.stringify([options.rootMargin, options.threshold]);
  let rec = observers.get(key);
  if (!rec) {
    const cbs = new Map<Element, Callback>();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => cbs.get(e.target)?.(e)),
      options,
    );
    rec = { io, cbs };
    observers.set(key, rec);
  }
  return rec;
}

/**
 * Reports whether an element is on screen.
 * once = true: flips to true the first time and stops watching (for reveals).
 * once = false: tracks in/out continuously (for pausing marquees and timers).
 */
export function useInView(
  ref: RefObject<Element | null>,
  { once = true, rootMargin = "0px 0px -10% 0px", threshold = 0.15 }: {
    once?: boolean;
    rootMargin?: string;
    threshold?: number;
  } = {},
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { io, cbs } = getObserver({ rootMargin, threshold });
    cbs.set(el, (entry) => {
      setInView(entry.isIntersecting);
      if (once && entry.isIntersecting) {
        io.unobserve(el);
        cbs.delete(el);
      }
    });
    io.observe(el);
    return () => {
      io.unobserve(el);
      cbs.delete(el);
    };
  }, [ref, once, rootMargin, threshold]);
  return inView;
}

/** Runs a DOM update inside a View Transition when the browser supports it. */
export function withViewTransition(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(update);
  } else {
    update();
  }
}
