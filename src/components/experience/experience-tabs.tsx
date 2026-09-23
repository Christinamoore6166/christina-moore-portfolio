"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { RESUME, type ViewId } from "@/data/resume";
import { cn } from "@/lib/utils";
import { TimelineView } from "./timeline-view";
import { SkillsView } from "./skills-view";
import { OverviewView } from "./overview-view";
import { useSlidingIndicator } from "./use-sliding-indicator";

const DEFAULT_VIEW: ViewId = "timeline";

function viewFromHash(hash: string): ViewId | null {
  const target = hash.replace(/^#/, "");
  return RESUME.views.find((v) => v.hash === target)?.id ?? null;
}

/**
 * The three views behind one horizontal tablist: a single glass-dark
 * track with a sliding pill under the active label. Arrow keys move
 * between tabs and select as they go. The active view lives in the URL
 * hash and is read on load and on every hash change, so the nav's
 * #experience link always lands on Timeline.
 */
export function ExperienceTabs({ sectionId }: { sectionId: string }) {
  const [view, setView] = useState<ViewId>(DEFAULT_VIEW);
  const baseId = useId();
  const list = useRef<HTMLDivElement>(null);
  const indicator = useSlidingIndicator(list, view);

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

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = RESUME.views.findIndex((v) => v.id === view);
    const next =
      e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target =
      RESUME.views[(next + RESUME.views.length) % RESUME.views.length];
    select(target.id);
    list.current
      ?.querySelector<HTMLButtonElement>(`[data-key="${target.id}"]`)
      ?.focus();
  };

  const tabId = (id: ViewId) => `${baseId}-tab-${id}`;
  const panelId = (id: ViewId) => `${baseId}-panel-${id}`;

  return (
    <div>
      <div
        ref={list}
        role="tablist"
        aria-label={RESUME.section.title}
        onKeyDown={onKeyDown}
        className="glass-dark relative inline-flex rounded-pill p-1"
      >
        <span
          aria-hidden="true"
          className="bg-primary absolute inset-y-1 left-0 rounded-pill transition-[transform,width] duration-base ease-standard motion-reduce:transition-none"
          style={{
            transform: indicator.transform,
            width: indicator.width,
            opacity: indicator.opacity,
          }}
        />
        {RESUME.views.map((v) => {
          const active = v.id === view;
          return (
            <button
              key={v.id}
              data-key={v.id}
              type="button"
              role="tab"
              id={tabId(v.id)}
              aria-selected={active}
              aria-controls={panelId(v.id)}
              tabIndex={active ? 0 : -1}
              onClick={() => select(v.id)}
              className={cn(
                "tap-target rounded-pill px-5 py-2 type-small transition-ink",
                active ? "text-primary-foreground" : "text-ink-soft hover:text-ink",
              )}
            >
              {v.label}
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
        className="mt-block"
      >
        {view === "timeline" ? <TimelineView /> : null}
        {view === "skills" ? <SkillsView /> : null}
        {view === "overview" ? <OverviewView /> : null}
      </div>
    </div>
  );
}
