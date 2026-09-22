"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * True when the visitor has asked the OS for reduced motion.
 *
 * A subscription rather than state set from an effect, so the first
 * client render already has the real answer and nothing re-renders on
 * mount. The server snapshot is false, which matches the CSS: the
 * reduced-motion branch in globals.css is what actually holds motion
 * still, and this hook only exists for the cases CSS cannot reach.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/* One shared IntersectionObserver per option set. Every reveal on the
   page uses the same margin and threshold, so 100+ elements cost one
   observer rather than one each. */
type Callback = (entry: IntersectionObserverEntry) => void;

const observers = new Map<
  string,
  { io: IntersectionObserver; cbs: Map<Element, Callback> }
>();

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
 * Watch one element through the shared observer for its option set and
 * return an unsubscribe. The low-level form: it hands back the entry
 * rather than a boolean, so a caller that needs a third state (not yet
 * measured) can tell that apart from "off screen". <Reveal> depends on
 * that distinction; see the note there.
 *
 * Safe to call where IntersectionObserver does not exist: the callback
 * simply never fires.
 */
export function observeElement(
  el: Element,
  options: IntersectionObserverInit,
  cb: Callback,
): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};

  const { io, cbs } = getObserver(options);
  cbs.set(el, cb);
  io.observe(el);

  return () => {
    io.unobserve(el);
    cbs.delete(el);
  };
}

/**
 * Reports whether an element is on screen.
 * once = true: flips to true the first time and stops watching.
 * once = false: tracks in and out continuously, for pausing a marquee
 * or a timer.
 */
export function useInView(
  ref: RefObject<Element | null>,
  {
    once = true,
    rootMargin = "0px 0px -10% 0px",
    threshold = 0.15,
  }: { once?: boolean; rootMargin?: string; threshold?: number } = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Held on an object so the callback can unsubscribe itself without
       referring to a binding that is not assigned yet. */
    const handle: { stop?: () => void } = {};
    handle.stop = observeElement(el, { rootMargin, threshold }, (entry) => {
      setInView(entry.isIntersecting);
      if (once && entry.isIntersecting) handle.stop?.();
    });

    return () => handle.stop?.();
  }, [ref, once, rootMargin, threshold]);

  return inView;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

function hasViewTransitions(): boolean {
  const doc = document as ViewTransitionDocument;
  return typeof doc.startViewTransition === "function";
}

/** Runs a DOM update inside a View Transition where the browser has one. */
export function withViewTransition(update: () => void) {
  const doc = document as ViewTransitionDocument;
  if (hasViewTransitions()) {
    doc.startViewTransition!(update);
  } else {
    update();
  }
}

/* Support does not change over a session, so there is nothing to
   subscribe to. A store rather than state set from an effect for the
   same reason as usePrefersReducedMotion: the first client render has
   the real answer already, and nothing re-renders on mount. The server
   snapshot says yes, so server markup carries no fallback class and
   hydration matches on the browsers that have the feature. */
const subscribeNever = () => () => {};

/**
 * Whether the browser can run the showcase's card-to-feature morph.
 * Deliberately the same test withViewTransition makes, so a component
 * choosing a fallback animation can never disagree with the helper
 * about which path is live and play both.
 */
export function useHasViewTransitions(): boolean {
  return useSyncExternalStore(subscribeNever, hasViewTransitions, () => true);
}
