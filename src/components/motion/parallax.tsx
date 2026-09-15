"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /**
   * Drift as a fraction of the element height at the ends of travel.
   * Keep it under 0.07: the child is scaled 1.14 (see the parallax
   * utility) so the drift never exposes an edge.
   */
  amount?: number;
}

/**
 * The one parallax. Sets --parallax on the wrapper from the element's
 * position in the viewport; the CSS utility applies it to the child. The
 * child lags the page slightly, so it reads as depth rather than motion.
 * Does nothing under prefers-reduced-motion.
 */
export function Parallax({ children, className, amount = 0.06 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const centre = rect.top + rect.height / 2 - vh / 2;
      const progress = Math.max(-1, Math.min(1, centre / vh));
      el.style.setProperty(
        "--parallax",
        `${(-progress * amount * 100).toFixed(2)}%`,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [amount]);

  return (
    <div ref={ref} className={className ? `parallax ${className}` : "parallax"}>
      {children}
    </div>
  );
}
