"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { observeElement } from "@/lib/motion";

/**
 * fade: the block lifts and fades in. The default, and what every
 *       existing caller gets.
 * mask: a photo unmasks from a clip-path inset (.reveal-mask).
 * stagger: the direct children arrive one after another, 70ms apart
 *       (.stagger, driven by --i).
 */
type RevealVariant = "fade" | "mask" | "stagger";

interface RevealProps {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Extra delay in ms, for staggering siblings. Unused by "stagger". */
  delay?: number;
  /** Reveal once and stay (default), or toggle as it leaves and returns. */
  once?: boolean;
  /** Root margin. The default waits until 10% of the viewport is cleared. */
  margin?: string;
  variant?: RevealVariant;
  style?: CSSProperties;
  id?: string;
}

/**
 * Fades and lifts its content into view on scroll. The motion itself is
 * CSS (see [data-reveal] in globals.css); this only flips the attribute.
 * Reduced motion and no-JS both render the content visible and still.
 *
 * The attribute is set imperatively rather than rendered, on purpose:
 * until the observer has actually measured the element there is no
 * attribute at all, so server-rendered HTML and slow hydration show the
 * finished state instead of a blank block. That is why this uses
 * observeElement rather than the useInView boolean, which cannot tell
 * "not measured yet" from "off screen".
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  once = true,
  margin = "0px 0px -10% 0px",
  variant = "fade",
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* stagger drives its direct children, so the wrapper itself never
       carries the attribute. Everything else drives the wrapper. */
    const targets =
      variant === "stagger"
        ? Array.from(el.children).filter(
            (c): c is HTMLElement => c instanceof HTMLElement,
          )
        : [el];

    if (targets.length === 0) return;

    /* One custom property per child; CSS turns it into the delay, so
       there are no per-element timers. */
    if (variant === "stagger") {
      targets.forEach((child, i) => child.style.setProperty("--i", String(i)));
    }

    const set = (state: "in" | "out") => {
      for (const t of targets) t.dataset.reveal = state;
    };

    /* Held on an object so the callback can unsubscribe itself without
       referring to a binding that is not assigned yet. */
    const handle: { stop?: () => void } = {};
    handle.stop = observeElement(
      el,
      { rootMargin: margin, threshold: 0 },
      (entry) => {
        if (entry.isIntersecting) {
          set("in");
          if (once) handle.stop?.();
        } else {
          set("out");
        }
      },
    );

    return () => handle.stop?.();
  }, [once, margin, variant]);

  const base =
    variant === "mask" ? "reveal-mask" : variant === "stagger" ? "stagger" : "";
  const classes = [base, className].filter(Boolean).join(" ") || undefined;

  const inline = {
    ...style,
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <Tag ref={ref} id={id} className={classes} style={inline}>
      {children}
    </Tag>
  );
}
