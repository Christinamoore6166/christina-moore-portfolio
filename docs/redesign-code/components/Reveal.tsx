"use client";

import { Children, cloneElement, isValidElement, useRef, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { useInView } from "@/lib/motion";

type Props = {
  children: ReactNode;
  /** "fade" = fade up (existing reveal); "mask" = photo unmask; "stagger" = children one after another */
  variant?: "fade" | "mask" | "stagger";
  as?: "div" | "section" | "ul" | "ol" | "figure";
  className?: string;
};

/**
 * Adds `.is-in` once the block scrolls into view.
 * All timing lives in globals.css (.reveal, .reveal-mask, .stagger), so reduced motion is handled there.
 */
export function Reveal({ children, variant = "fade", as: Tag = "div", className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const base = variant === "mask" ? "reveal-mask" : variant === "stagger" ? "stagger" : "reveal";

  const content =
    variant === "stagger"
      ? Children.map(children, (child, i) =>
          isValidElement(child)
            ? cloneElement(child as ReactElement<{ style?: CSSProperties }>, {
                style: { ...((child.props as { style?: CSSProperties }).style ?? {}), "--i": i } as CSSProperties,
              })
            : child,
        )
      : children;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`${base} ${inView ? "is-in" : ""} ${className}`}>
      {content}
    </Tag>
  );
}
