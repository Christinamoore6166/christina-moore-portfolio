"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Measures the active item inside a container and returns inline styles
 * for one absolutely positioned indicator (a pill or underline) that slides between items.
 * Items need a matching data-key attribute.
 */
export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  activeKey: string | null,
) {
  const [style, setStyle] = useState<{ transform: string; width: number; opacity: number }>({
    transform: "translateX(0px)",
    width: 0,
    opacity: 0,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !activeKey) return;

    const measure = () => {
      const item = container.querySelector<HTMLElement>(`[data-key="${CSS.escape(activeKey)}"]`);
      if (!item) return;
      const c = container.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      setStyle({ transform: `translateX(${r.left - c.left}px)`, width: r.width, opacity: 1 });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, activeKey]);

  return style;
}
