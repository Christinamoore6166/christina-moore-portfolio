"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "@/lib/motion";

/**
 * Wraps your EXISTING marquee track. Only adds: pause when off screen.
 * Your current classes (animate-[marquee-scroll...], group-hover pause, motion-reduce grid) stay as they are.
 */
export function Marquee({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, { once: false, threshold: 0, rootMargin: "200px 0px" });
  return (
    <div ref={ref} className={`group ${className}`} data-offscreen={!onScreen}>
      {children}
    </div>
  );
}
