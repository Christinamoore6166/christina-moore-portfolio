"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSlidingIndicator } from "@/components/motion/use-sliding-indicator";

export interface NavSection {
  id: string;
  number: string;
  title: string;
}

/* The pill floats 12px in from the top, so the sentinel has to agree
   with that offset or the glass would arrive 12px late. */
const PIN_INSET = 12;

/**
 * Quiet section navigation, as a floating frosted pill. Rendered in the
 * flow directly below the hero and sticky from there, so it only pins
 * once the hero has scrolled past. Transparent while it sits in the
 * flow; once pinned it turns to glass, and to dark glass over an
 * espresso (.theme-inverse) section so the links stay legible.
 *
 * The sticky element spans the width but ignores pointer events; only
 * the pill itself is visible and interactive. Olive marks the current
 * section, its one job in the system: one sliding dash from md up, and
 * the per-item dash below that, where the list is a dropdown.
 *
 * Mobile: collapses to the current number and name; the button opens
 * the list. Escape closes it and returns focus to the button.
 */
export function SiteNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const indicator = useSlidingIndicator(listRef, active);

  /* Glass on once the pill pins, off while it is still in the flow.
     A sentinel rather than a scroll listener: this fires twice per
     page, not on every frame. The root is shrunk by the pin inset so
     the flip lands exactly where the pill stops moving. */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setPinned(
          !entry.isIntersecting && entry.boundingClientRect.top < PIN_INSET,
        );
      },
      { rootMargin: `-${PIN_INSET}px 0px 0px 0px`, threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    /* Experience carries its espresso plate on a child div, not on the
       section itself, so ask for either. Checking only the section left
       the pill light over the one dark band on the page. */
    const isDark = (el: Element) =>
      el.classList.contains("theme-inverse") ||
      el.querySelector(".theme-inverse") !== null;

    /* A section is current while it crosses a thin band 40% down the
       viewport, so the marker changes as a section heading arrives. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            setOnDark(isDark(entry.target));
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sections]);

  /* Below md the pill sits at the end of the hero until it pins, which
     leaves the dropdown less than its own height of room. Measured on
     open rather than assumed, so the list opens upward only when it
     would otherwise run past the bottom of the screen. */
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const button = buttonRef.current;
    if (!list || !button) return;
    const room = window.innerHeight - button.getBoundingClientRect().bottom;
    setDropUp(list.offsetHeight + PIN_INSET > room);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const current = sections.find((s) => s.id === active) ?? sections[0];
  if (!current) return null;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      <nav
        ref={rootRef}
        aria-label="Sections"
        className="pointer-events-none sticky top-3 z-40 px-3"
      >
        <div
          className={`pointer-events-auto nav-pill relative mx-auto w-fit px-3 py-1.5 type-caption ${
            pinned ? "is-scrolled" : ""
          } ${onDark ? "is-inverse" : ""}`}
        >
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((o) => !o)}
            className="tap-target flex items-center gap-2 py-1 text-ink md:hidden"
          >
            <span aria-hidden="true" className="h-0.5 w-4 bg-mark" />
            <span className="tabular-nums text-ink-soft">{current.number}</span>{" "}
            <span>{current.title}</span>
            {open ? (
              <ChevronUp aria-hidden="true" className="size-3.5 text-ink-soft" />
            ) : (
              <ChevronDown aria-hidden="true" className="size-3.5 text-ink-soft" />
            )}
          </button>

          <ol
            id={listId}
            ref={listRef}
            className={`${open ? "flex" : "hidden"} ${
              dropUp
                ? "bottom-full mb-1 md:bottom-auto md:mb-0"
                : "top-full mt-1 md:top-auto md:mt-0"
            } absolute right-0 min-w-56 flex-col gap-1 border border-rule bg-page p-3 md:relative md:right-auto md:flex md:min-w-0 md:flex-row md:items-center md:gap-6 md:border-0 md:p-0`}
          >
            {/* One olive dash that slides under the active link. Hidden
                below md, where the list is a stacked dropdown and each
                item carries its own dash instead. */}
            <span
              aria-hidden="true"
              style={indicator}
              className="nav-dash absolute bottom-0 left-0 hidden h-0.5 md:block"
            />
            {sections.map((s) => {
              const isActive = s.id === active;
              return (
                <li key={s.id} data-key={s.id} className="relative">
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 py-3.5 transition-ink md:py-1 ${
                      isActive
                        ? "text-ink forced-colors:underline forced-colors:font-semibold"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-0.5 w-4 transition-ink md:hidden ${isActive ? "bg-mark" : "bg-transparent"}`}
                    />
                    <span className="tabular-nums text-ink-soft">{s.number}</span>{" "}
                    <span>{s.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
