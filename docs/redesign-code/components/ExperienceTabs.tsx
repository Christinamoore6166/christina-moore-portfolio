"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useSlidingIndicator } from "./useSlidingIndicator";

export type Tab = { key: string; label: string; panel: ReactNode };

/**
 * Timeline / Skills / Overview with one sliding glass pill and a cross-fade between panels.
 * Pass your existing panel content in; nothing inside the panels changes.
 */
export function ExperienceTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const list = useRef<HTMLDivElement>(null);
  const indicator = useSlidingIndicator(list, active);

  const onKey = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.key === active);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    const t = tabs[(next + tabs.length) % tabs.length];
    setActive(t.key);
    list.current?.querySelector<HTMLButtonElement>(`[data-key="${t.key}"]`)?.focus();
  };

  return (
    <div>
      <div ref={list} role="tablist" onKeyDown={onKey} className="glass-dark relative inline-flex rounded-full p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 left-0 rounded-full bg-[var(--color-coral)] transition-[transform,width] duration-base ease-out motion-reduce:transition-none"
          style={indicator}
        />
        {tabs.map((t) => (
          <button
            key={t.key}
            data-key={t.key}
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={active === t.key}
            aria-controls={`panel-${t.key}`}
            tabIndex={active === t.key ? 0 : -1}
            onClick={() => setActive(t.key)}
            className={`relative rounded-full px-5 py-2 type-small transition-colors duration-fast ${
              active === t.key ? "text-[var(--color-espresso)]" : "text-[var(--ink-soft)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mt-8 grid">
        {tabs.map((t) => (
          <div
            key={t.key}
            id={`panel-${t.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${t.key}`}
            hidden={active !== t.key}
            data-active={active === t.key}
            className="tab-panel [grid-area:1/1]"
          >
            {t.panel}
          </div>
        ))}
      </div>
    </div>
  );
}
