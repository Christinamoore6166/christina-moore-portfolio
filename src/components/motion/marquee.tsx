"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "@/lib/motion";

/**
 * Wraps an existing marquee track and does exactly one thing: pause its
 * scroll while it is off screen. The keyframe, the loop math and any
 * hover/focus pause stay with the caller; this only sets data-offscreen,
 * which the [data-marquee-track] rule in globals.css reads.
 */
export function Marquee({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, {
    once: false,
    threshold: 0,
    rootMargin: "200px 0px",
  });

  return (
    <div ref={ref} className={`group ${className}`} data-offscreen={!onScreen}>
      {children}
    </div>
  );
}
