"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Extra delay in ms, for staggering siblings. */
  delay?: number;
  /** Reveal once and stay (default), or toggle as it leaves and returns. */
  once?: boolean;
  /** Root margin. The default waits until 10% of the viewport is cleared. */
  margin?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Fades and lifts its content into view on scroll. The motion itself is
 * CSS (see [data-reveal] in globals.css); this only flips the attribute.
 * Reduced motion and no-JS both render the content visible and still.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  once = true,
  margin = "0px 0px -10% 0px",
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || typeof IntersectionObserver === "undefined") {
      el.dataset.reveal = "in";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.reveal = "in";
            if (once) io.unobserve(el);
          } else if (!once) {
            el.dataset.reveal = "out";
          }
        }
      },
      { threshold: 0, rootMargin: margin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, margin]);

  const inline = {
    ...style,
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal="out"
      className={className}
      style={inline}
    >
      {children}
    </Tag>
  );
}
