"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { RESUME, type ViewId } from "@/data/resume";
import { cn } from "@/lib/utils";
import { TimelineView } from "./timeline-view";
import { SkillsView } from "./skills-view";
import { OverviewView } from "./overview-view";

const DEFAULT_VIEW: ViewId = "timeline";

function viewFromHash(hash: string): ViewId | null {
  const target = hash.replace(/^#/, "");
  return RESUME.views.find((v) => v.hash === target)?.id ?? null;
}

/**
 * The three views behind a vertical tablist: a ruled row list with the
 * olive marker on the active row and a trailing arrow in the rule colour.
 * Arrow keys, Home and End move between tabs and select as they go. The
 * active view lives in the URL hash and is read on load and on every
 * hash change, so the nav's #experience link always lands on Timeline.
 */
export function ExperienceTabs({ sectionId }: { sectionId: string }) {
  const [view, setView] = useState<ViewId>(DEFAULT_VIEW);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const sync = () => {
      const next = viewFromHash(window.location.hash);
      if (!next) return;
      setView(next);
      /* Only the section carries an id the browser can jump to, so the
         view hashes need the scroll done here. */
      if (next !== DEFAULT_VIEW) {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [sectionId]);

  const select = (id: ViewId) => {
    setView(id);
    const target = RESUME.views.find((v) => v.id === id);
    if (target) history.replaceState(null, "", `#${target.hash}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = RESUME.views.length;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = (index + 1) % count;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = (index - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
    }
    if (next === null) return;
    e.preventDefault();
    tabRefs.current[next]?.focus();
    select(RESUME.views[next].id);
  };

  const tabId = (id: ViewId) => `${baseId}-tab-${id}`;
  const panelId = (id: ViewId) => `${baseId}-panel-${id}`;

  return (
    <div className="grid gap-block md:grid-cols-12">
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label={RESUME.section.title}
        className="self-start border-t border-rule md:col-span-4 lg:col-span-3"
      >
        {RESUME.views.map((v, i) => {
          const active = v.id === view;
          return (
            <button
              key={v.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={tabId(v.id)}
              aria-selected={active}
              aria-controls={panelId(v.id)}
              tabIndex={active ? 0 : -1}
              onClick={() => select(v.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-rule py-3 text-left font-display type-h3 transition-ink",
                active ? "text-ink" : "text-ink-soft hover:text-ink",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-0.5 w-4 shrink-0 transition-ink",
                  active ? "bg-mark" : "bg-transparent",
                )}
              />
              <span className="flex-1">{v.label}</span>
              <ArrowRight
                aria-hidden="true"
                className={cn(
                  "size-5 shrink-0 text-rule transition-ink",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div
        key={view}
        role="tabpanel"
        id={panelId(view)}
        aria-labelledby={tabId(view)}
        tabIndex={view === "skills" ? 0 : undefined}
        className="md:col-span-8 md:col-start-5 lg:col-span-8 lg:col-start-5"
      >
        {view === "timeline" ? <TimelineView /> : null}
        {view === "skills" ? <SkillsView /> : null}
        {view === "overview" ? <OverviewView /> : null}
      </div>
    </div>
  );
}
