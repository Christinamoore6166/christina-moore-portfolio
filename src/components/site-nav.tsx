"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface NavSection {
  id: string;
  number: string;
  title: string;
}

/**
 * Quiet section navigation. Rendered in the flow directly below the hero
 * and sticky from there, so it only pins once the hero has scrolled past.
 * The sticky element spans the width but ignores pointer events; only the
 * corner cluster is visible and interactive. Olive marks the current
 * section, its one job in the system.
 *
 * Mobile: collapses to the current number and name; the button opens the
 * list. Escape closes it and returns focus to the button.
 */
export function SiteNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    /* A section is current while it crosses a thin band 40% down the
       viewport, so the marker changes as a section heading arrives. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sections]);

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
    <nav
      ref={rootRef}
      aria-label="Sections"
      className="pointer-events-none sticky top-0 z-40"
    >
      <div className="frame flex justify-end">
        <div className="pointer-events-auto relative bg-page py-2 pl-3 type-caption">
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 py-1 text-ink md:hidden"
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
            className={`${open ? "flex" : "hidden"} absolute top-full right-0 mt-1 min-w-56 flex-col gap-1 border border-rule bg-page p-3 md:static md:mt-0 md:flex md:min-w-0 md:flex-row md:items-center md:gap-6 md:border-0 md:p-0`}
          >
            {sections.map((s) => {
              const isActive = s.id === active;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 py-1 transition-ink ${
                      isActive
                        ? "text-ink forced-colors:underline forced-colors:font-semibold"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-0.5 w-4 transition-ink ${isActive ? "bg-mark" : "bg-transparent"}`}
                    />
                    <span className="tabular-nums text-ink-soft">{s.number}</span>{" "}
                    <span>{s.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}
