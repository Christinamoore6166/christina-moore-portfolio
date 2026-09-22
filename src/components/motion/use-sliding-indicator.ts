"use client";

import { useEffect, useState, type RefObject } from "react";

export interface IndicatorStyle {
  transform: string;
  width: number;
  opacity: number;
}

/**
 * Measures the active item inside a container and returns inline styles
 * for one absolutely positioned indicator that slides between items.
 * Items need a matching data-key attribute.
 *
 * Starts at zero width and zero opacity, so nothing shows until the
 * first measurement lands. A zero-width measurement is ignored: below
 * md the list is a closed dropdown and every item measures zero, and
 * the indicator is hidden at that width anyway.
 */
export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  activeKey: string | null,
): IndicatorStyle {
  const [style, setStyle] = useState<IndicatorStyle>({
    transform: "translateX(0px)",
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !activeKey) return;

    const measure = () => {
      const item = container.querySelector<HTMLElement>(
        `[data-key="${CSS.escape(activeKey)}"]`,
      );
      if (!item) return;

      const c = container.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      if (r.width === 0) return;

      setStyle({
        transform: `translateX(${r.left - c.left}px)`,
        width: r.width,
        opacity: 1,
      });
    };

    measure();

    /* Catches the md breakpoint flip, a font swap and any reflow that
       changes the row, without a resize listener. */
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, activeKey]);

  return style;
}
