"use client";

import { useEffect, useRef, useState } from "react";
import { useSlidingIndicator } from "./useSlidingIndicator";

export type NavItem = { id: string; num: string; label: string };

/**
 * Floating frosted pill nav.
 * Pass your EXISTING items (same numbers, labels, and ids) so no copy changes.
 */
export function GlassNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const indicator = useSlidingIndicator(list, active);

  // 1. Transparent at the top, glass once the page scrolls.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2. Active section = the one crossing the upper third of the viewport.
  //    Also detect espresso (.theme-inverse) sections to switch to dark glass.
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((s): s is HTMLElement => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(e.target.id);
            setOnDark(e.target.classList.contains("theme-inverse"));
          }
        });
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      <nav
        aria-label="Sections"
        className={`sticky top-3 z-40 mx-auto w-fit rounded-full px-2 py-1.5 transition-[background-color,backdrop-filter,box-shadow] duration-base ${
          scrolled ? (onDark ? "glass-dark" : "glass") : ""
        }`}
      >
        <ul ref={list} className="relative flex gap-1">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 rounded-full bg-[var(--hover)] transition-[transform,width,opacity] duration-base ease-out motion-reduce:transition-none"
            style={indicator}
          />
          {items.map((item) => (
            <li key={item.id} data-key={item.id} className="relative">
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                className="flex items-center gap-2 rounded-full px-4 py-2 type-small text-ink transition-colors duration-fast"
              >
                <span className="tabular-nums text-ink-soft">{item.num}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
